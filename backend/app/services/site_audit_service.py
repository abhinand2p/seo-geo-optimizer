import aiohttp
import asyncio
import ssl
import certifi
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin
from datetime import datetime
import time
import re
from anthropic import Anthropic
from app.core.config import settings

class SiteAuditService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def audit_website(self, url: str, depth: int = 5) -> Dict:
        """
        Main entry point for website audit.
        Returns comprehensive audit data.
        """
        start_time = time.time()

        try:
            # Crawl pages
            pages = await self._crawl_pages(url, max_pages=depth)

            if not pages:
                raise Exception("Failed to fetch website content")

            # Run analyses in parallel
            seo_analysis_task = self._analyze_seo(pages, url)
            design_analysis_task = self._analyze_design(url, pages)
            content_analysis_task = self._analyze_content(pages)

            seo_analysis, design_analysis, content_analysis = await asyncio.gather(
                seo_analysis_task,
                design_analysis_task,
                content_analysis_task
            )

            # Calculate overall score
            overall_score = self._calculate_overall_score(
                seo_analysis['score'],
                design_analysis['score'],
                content_analysis['score']
            )

            # Collect all issues
            all_issues = seo_analysis['issues'] + design_analysis['issues'] + content_analysis['issues']

            # Count issue severities
            critical_count = sum(1 for issue in all_issues if issue['severity'] == 'critical')
            warning_count = sum(1 for issue in all_issues if issue['severity'] == 'warning')

            # Generate AI suggestions
            suggestions = await self._generate_ai_suggestions({
                'seo': seo_analysis,
                'design': design_analysis,
                'content': content_analysis,
                'overall_score': overall_score
            })

            # Prepare page analysis
            page_analyses = [
                {
                    'url': page['url'],
                    'title': page.get('title'),
                    'status_code': page['status'],
                    'load_time_ms': page.get('load_time', 0)
                }
                for page in pages
            ]

            duration = time.time() - start_time
            domain = urlparse(url).netloc

            return {
                'success': True,
                'domain': domain,
                'pages_analyzed': len(pages),
                'overall_score': overall_score,
                'seo_score': seo_analysis['score'],
                'design_score': design_analysis['score'],
                'content_score': content_analysis['score'],
                'total_issues': len(all_issues),
                'critical_issues': critical_count,
                'warnings': warning_count,
                'issues': all_issues,
                'seo_analysis': seo_analysis,
                'design_analysis': design_analysis,
                'content_analysis': content_analysis,
                'suggestions': suggestions,
                'screenshot_url': None,  # Will be implemented with Playwright
                'pages': page_analyses,
                'lighthouse_score': design_analysis.get('lighthouse'),
                'pagespeed_score': design_analysis.get('pagespeed'),
                'analyzed_at': datetime.now().isoformat(),
                'analysis_duration_seconds': round(duration, 2)
            }

        except Exception as e:
            print(f"Error during audit: {e}")
            import traceback
            traceback.print_exc()
            raise

    async def _crawl_pages(self, start_url: str, max_pages: int = 5) -> List[Dict]:
        """
        Crawl website pages starting from the homepage.
        """
        pages = []
        visited = set()
        to_visit = [start_url]
        base_domain = urlparse(start_url).netloc

        # Create SSL context with certifi certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        connector = aiohttp.TCPConnector(ssl=ssl_context)

        # Headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }

        async with aiohttp.ClientSession(connector=connector, headers=headers) as session:
            while to_visit and len(pages) < max_pages:
                url = to_visit.pop(0)

                if url in visited:
                    continue

                visited.add(url)

                try:
                    start_time = time.time()
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=15), allow_redirects=True) as response:
                        load_time = (time.time() - start_time) * 1000

                        # Accept 200 and 403 (some sites return 403 but still have content)
                        if response.status in [200, 403]:
                            html = await response.text()
                            soup = BeautifulSoup(html, 'html.parser')

                            # Extract title
                            title = soup.find('title')
                            title_text = title.get_text() if title else None

                            pages.append({
                                'url': url,
                                'html': html,
                                'soup': soup,
                                'status': response.status,
                                'title': title_text,
                                'load_time': load_time
                            })

                            # Extract links for further crawling (only if we need more pages)
                            if len(pages) < max_pages:
                                for link in soup.find_all('a', href=True):
                                    href = link['href']
                                    absolute_url = urljoin(url, href)
                                    link_domain = urlparse(absolute_url).netloc

                                    # Only crawl same domain
                                    if link_domain == base_domain and absolute_url not in visited:
                                        to_visit.append(absolute_url)

                except Exception as e:
                    print(f"Error crawling {url}: {e}")
                    continue

        return pages

    async def _analyze_seo(self, pages: List[Dict], base_url: str) -> Dict:
        """
        Analyze SEO aspects of the website.
        """
        score = 0
        issues = []

        # Analyze first page (homepage) primarily
        main_page = pages[0]
        soup = main_page['soup']

        # Title tag (15 points)
        title = soup.find('title')
        if title and title.get_text().strip():
            title_text = title.get_text().strip()
            if 30 <= len(title_text) <= 60:
                score += 15
            else:
                score += 10
                issues.append({
                    'severity': 'warning',
                    'category': 'seo',
                    'title': 'Title Length Not Optimal',
                    'description': f'Title is {len(title_text)} characters. Optimal length is 30-60 characters.'
                })
        else:
            issues.append({
                'severity': 'critical',
                'category': 'seo',
                'title': 'Missing Title Tag',
                'description': 'Every page should have a unique, descriptive title tag.'
            })

        # Meta description (10 points)
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            desc_text = meta_desc['content']
            if 120 <= len(desc_text) <= 160:
                score += 10
            else:
                score += 5
                issues.append({
                    'severity': 'warning',
                    'category': 'seo',
                    'title': 'Meta Description Length Not Optimal',
                    'description': f'Meta description is {len(desc_text)} characters. Optimal length is 120-160 characters.'
                })
        else:
            issues.append({
                'severity': 'critical',
                'category': 'seo',
                'title': 'Missing Meta Description',
                'description': 'Meta descriptions help search engines understand page content.'
            })

        # H1 tag (10 points)
        h1_tags = soup.find_all('h1')
        if len(h1_tags) == 1:
            score += 10
        elif len(h1_tags) == 0:
            issues.append({
                'severity': 'critical',
                'category': 'seo',
                'title': 'Missing H1 Tag',
                'description': 'Every page should have exactly one H1 tag describing the main content.'
            })
        else:
            score += 5
            issues.append({
                'severity': 'warning',
                'category': 'seo',
                'title': 'Multiple H1 Tags',
                'description': f'Found {len(h1_tags)} H1 tags. Best practice is to have exactly one H1 per page.'
            })

        # Heading hierarchy (10 points)
        h2_tags = soup.find_all('h2')
        h3_tags = soup.find_all('h3')
        if h2_tags:
            score += 10
        else:
            issues.append({
                'severity': 'warning',
                'category': 'seo',
                'title': 'Poor Heading Structure',
                'description': 'Use H2-H6 tags to create a clear content hierarchy.'
            })

        # Image alt tags (15 points)
        images = soup.find_all('img')
        if images:
            images_with_alt = [img for img in images if img.get('alt')]
            alt_percentage = (len(images_with_alt) / len(images)) * 100

            if alt_percentage == 100:
                score += 15
            elif alt_percentage >= 80:
                score += 10
            elif alt_percentage >= 50:
                score += 5

            if alt_percentage < 100:
                issues.append({
                    'severity': 'warning' if alt_percentage >= 50 else 'critical',
                    'category': 'seo',
                    'title': 'Missing Image Alt Text',
                    'description': f'Only {alt_percentage:.0f}% of images have alt text. All images should have descriptive alt attributes.'
                })
        else:
            score += 15  # No images, so no issue

        # OpenGraph tags (10 points)
        og_tags = soup.find_all('meta', attrs={'property': re.compile(r'^og:')})
        if len(og_tags) >= 4:  # og:title, og:description, og:image, og:url
            score += 10
        elif len(og_tags) > 0:
            score += 5
            issues.append({
                'severity': 'info',
                'category': 'seo',
                'title': 'Incomplete OpenGraph Tags',
                'description': 'Add more OpenGraph tags for better social media sharing.'
            })
        else:
            issues.append({
                'severity': 'warning',
                'category': 'seo',
                'title': 'Missing OpenGraph Tags',
                'description': 'OpenGraph tags improve how your site appears when shared on social media.'
            })

        # Structured data (10 points)
        json_ld = soup.find_all('script', attrs={'type': 'application/ld+json'})
        if json_ld:
            score += 10
        else:
            issues.append({
                'severity': 'info',
                'category': 'seo',
                'title': 'No Structured Data',
                'description': 'Implement schema.org structured data to help search engines understand your content.'
            })

        # Canonical URL (5 points)
        canonical = soup.find('link', attrs={'rel': 'canonical'})
        if canonical:
            score += 5
        else:
            issues.append({
                'severity': 'info',
                'category': 'seo',
                'title': 'Missing Canonical URL',
                'description': 'Canonical tags prevent duplicate content issues.'
            })

        # Mobile viewport (5 points)
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if viewport:
            score += 5
        else:
            issues.append({
                'severity': 'warning',
                'category': 'seo',
                'title': 'Missing Viewport Meta Tag',
                'description': 'Add viewport meta tag for mobile responsiveness.'
            })

        return {
            'score': min(score, 100),
            'issues': issues,
            'details': {
                'title_tag': title.get_text() if title else None,
                'meta_description': meta_desc['content'] if meta_desc else None,
                'h1_count': len(h1_tags),
                'images_total': len(images) if images else 0,
                'images_with_alt': len(images_with_alt) if images else 0,
                'og_tags_count': len(og_tags),
                'has_structured_data': len(json_ld) > 0
            }
        }

    async def _analyze_design(self, url: str, pages: List[Dict]) -> Dict:
        """
        Analyze design and performance aspects.
        """
        score = 0
        issues = []

        main_page = pages[0]
        soup = main_page['soup']

        # Mobile responsive (20 points)
        viewport = soup.find('meta', attrs={'name': 'viewport'})
        if viewport:
            score += 20
        else:
            issues.append({
                'severity': 'critical',
                'category': 'design',
                'title': 'Not Mobile Responsive',
                'description': 'Add viewport meta tag and ensure responsive design for mobile devices.'
            })

        # Load time (20 points)
        load_time = main_page.get('load_time', 0)
        if load_time < 1000:  # < 1 second
            score += 20
        elif load_time < 3000:  # < 3 seconds
            score += 15
        elif load_time < 5000:  # < 5 seconds
            score += 10
        else:
            issues.append({
                'severity': 'warning',
                'category': 'design',
                'title': 'Slow Page Load Time',
                'description': f'Page loads in {load_time/1000:.2f} seconds. Aim for under 3 seconds.'
            })

        # CSS Framework detection (5 points)
        has_css = soup.find('link', attrs={'rel': 'stylesheet'}) or soup.find('style')
        if has_css:
            score += 5

        # Font readability (5 points)
        # Check if custom fonts are loaded
        font_links = soup.find_all('link', attrs={'href': re.compile(r'font')})
        if font_links or soup.find('style', text=re.compile(r'@font-face')):
            score += 5

        # Images optimization check (10 points)
        images = soup.find_all('img')
        if images:
            # Check for lazy loading
            lazy_images = [img for img in images if img.get('loading') == 'lazy']
            if len(lazy_images) > 0:
                score += 5

            # Check for responsive images
            responsive_images = [img for img in images if img.get('srcset')]
            if len(responsive_images) > 0:
                score += 5

            if len(lazy_images) == 0 and len(images) > 3:
                issues.append({
                    'severity': 'info',
                    'category': 'design',
                    'title': 'Images Not Lazy Loaded',
                    'description': 'Implement lazy loading for images to improve initial page load.'
                })

        # Color contrast (placeholder - would need more complex analysis)
        score += 10

        # Accessibility features (10 points)
        # Check for aria labels
        aria_elements = soup.find_all(attrs={'aria-label': True})
        if aria_elements:
            score += 10
        else:
            issues.append({
                'severity': 'info',
                'category': 'design',
                'title': 'Limited Accessibility Features',
                'description': 'Add ARIA labels and improve accessibility for screen readers.'
            })

        # Try to call Google PageSpeed Insights (optional)
        lighthouse_score = None
        pagespeed_score = None

        # Note: Actual API calls would go here if API key is configured
        # For now, we'll use placeholder data

        return {
            'score': min(score, 100),
            'issues': issues,
            'lighthouse': lighthouse_score,
            'pagespeed': pagespeed_score,
            'details': {
                'load_time_ms': load_time,
                'is_mobile_responsive': viewport is not None,
                'has_custom_fonts': len(font_links) > 0 if font_links else False,
                'images_lazy_loaded': len(lazy_images) if images else 0,
                'total_images': len(images) if images else 0
            }
        }

    async def _analyze_content(self, pages: List[Dict]) -> Dict:
        """
        Analyze content quality and structure.
        """
        score = 0
        issues = []

        main_page = pages[0]
        soup = main_page['soup']

        # Extract main content text
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()

        text = soup.get_text()
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        text = ' '.join(line for line in lines if line)

        word_count = len(text.split())

        # Content length (20 points)
        if word_count >= 300:
            score += 20
        elif word_count >= 200:
            score += 15
        elif word_count >= 100:
            score += 10
        else:
            issues.append({
                'severity': 'warning',
                'category': 'content',
                'title': 'Insufficient Content',
                'description': f'Page has only {word_count} words. Aim for at least 300 words of quality content.'
            })

        # Readability (20 points - simplified Flesch-Kincaid)
        sentences = text.split('.')
        sentence_count = len([s for s in sentences if s.strip()])

        if sentence_count > 0:
            avg_words_per_sentence = word_count / sentence_count

            if avg_words_per_sentence <= 20:  # Good readability
                score += 20
            elif avg_words_per_sentence <= 25:
                score += 15
            elif avg_words_per_sentence <= 30:
                score += 10
            else:
                issues.append({
                    'severity': 'warning',
                    'category': 'content',
                    'title': 'Poor Readability',
                    'description': f'Average sentence length is {avg_words_per_sentence:.1f} words. Aim for 15-20 words per sentence.'
                })

        # Paragraph structure (10 points)
        paragraphs = soup.find_all('p')
        if len(paragraphs) >= 3:
            score += 10
        else:
            issues.append({
                'severity': 'info',
                'category': 'content',
                'title': 'Limited Content Structure',
                'description': 'Break content into more paragraphs for better readability.'
            })

        # Internal links (15 points)
        base_domain = urlparse(pages[0]['url']).netloc
        all_links = soup.find_all('a', href=True)
        internal_links = [link for link in all_links if base_domain in link.get('href', '')]

        if len(internal_links) >= 5:
            score += 15
        elif len(internal_links) >= 3:
            score += 10
        elif len(internal_links) >= 1:
            score += 5
        else:
            issues.append({
                'severity': 'warning',
                'category': 'content',
                'title': 'Insufficient Internal Linking',
                'description': 'Add more internal links to help users and search engines navigate your site.'
            })

        # External links (5 points)
        external_links = [link for link in all_links if base_domain not in link.get('href', '') and link.get('href', '').startswith('http')]
        if len(external_links) >= 2:
            score += 5

        # Headings for content structure (10 points)
        h2_tags = soup.find_all('h2')
        if len(h2_tags) >= 2:
            score += 10
        elif len(h2_tags) >= 1:
            score += 5
        else:
            issues.append({
                'severity': 'warning',
                'category': 'content',
                'title': 'Missing Content Headings',
                'description': 'Use H2 tags to structure your content and improve scannability.'
            })

        # Call to action (10 points)
        cta_keywords = ['contact', 'buy', 'shop', 'subscribe', 'sign up', 'get started', 'learn more']
        buttons = soup.find_all(['button', 'a'])
        has_cta = any(any(keyword in btn.get_text().lower() for keyword in cta_keywords) for btn in buttons)

        if has_cta:
            score += 10
        else:
            issues.append({
                'severity': 'info',
                'category': 'content',
                'title': 'No Clear Call-to-Action',
                'description': 'Add clear calls-to-action to guide users toward conversion.'
            })

        # Lists for scannability (10 points)
        lists = soup.find_all(['ul', 'ol'])
        if len(lists) >= 1:
            score += 10
        else:
            issues.append({
                'severity': 'info',
                'category': 'content',
                'title': 'No Lists or Bullet Points',
                'description': 'Use lists to make content more scannable and digestible.'
            })

        return {
            'score': min(score, 100),
            'issues': issues,
            'details': {
                'word_count': word_count,
                'sentence_count': sentence_count,
                'paragraph_count': len(paragraphs),
                'internal_links': len(internal_links),
                'external_links': len(external_links),
                'has_cta': has_cta
            }
        }

    def _calculate_overall_score(self, seo_score: int, design_score: int, content_score: int) -> int:
        """
        Calculate weighted overall score.
        SEO: 40%, Design: 35%, Content: 25%
        """
        return int((seo_score * 0.4) + (design_score * 0.35) + (content_score * 0.25))

    async def _generate_ai_suggestions(self, audit_data: Dict) -> List[Dict]:
        """
        Use Claude AI to generate intelligent suggestions.
        """
        seo = audit_data['seo']
        design = audit_data['design']
        content = audit_data['content']
        overall = audit_data['overall_score']

        prompt = f"""You are an expert website optimization consultant. Analyze the following website audit results and provide 5-7 actionable suggestions to improve the site.

Overall Score: {overall}/100
SEO Score: {seo['score']}/100
Design Score: {design['score']}/100
Content Score: {content['score']}/100

Key Issues Found:
{self._format_issues_for_prompt(seo['issues'] + design['issues'] + content['issues'])}

Provide suggestions in this exact format for each suggestion:
PRIORITY: [High/Medium/Low]
TITLE: [Brief title]
DESCRIPTION: [1-2 sentences explaining what to do]
IMPACT: [Expected improvement]

Focus on the most impactful changes first. Be specific and actionable."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )

            response_text = message.content[0].text
            suggestions = self._parse_ai_suggestions(response_text)

            return suggestions[:7]  # Limit to 7 suggestions

        except Exception as e:
            print(f"Error generating AI suggestions: {e}")
            # Return default suggestions if AI fails
            return [
                {
                    'priority': 'high',
                    'title': 'Improve Page Load Speed',
                    'description': 'Optimize images and minimize JavaScript to reduce load time.',
                    'impact': '15-20% improvement in user engagement'
                },
                {
                    'priority': 'high',
                    'title': 'Add Missing Meta Descriptions',
                    'description': 'Write unique, compelling meta descriptions for all pages.',
                    'impact': '10-15% increase in click-through rate'
                },
                {
                    'priority': 'medium',
                    'title': 'Enhance Mobile Responsiveness',
                    'description': 'Ensure all elements scale properly on mobile devices.',
                    'impact': '25% improvement in mobile user experience'
                }
            ]

    def _format_issues_for_prompt(self, issues: List[Dict]) -> str:
        """Format issues for AI prompt."""
        formatted = []
        for issue in issues[:10]:  # Limit to top 10 issues
            formatted.append(f"- [{issue['severity'].upper()}] {issue['title']}: {issue['description']}")
        return '\n'.join(formatted)

    def _parse_ai_suggestions(self, text: str) -> List[Dict]:
        """Parse AI response into structured suggestions."""
        suggestions = []

        # Split by PRIORITY markers
        parts = text.split('PRIORITY:')[1:]  # Skip first empty part

        for part in parts:
            try:
                lines = part.strip().split('\n')

                priority = lines[0].strip().lower()
                if priority not in ['high', 'medium', 'low']:
                    priority = 'medium'

                title = ''
                description = ''
                impact = ''

                for line in lines[1:]:
                    if line.startswith('TITLE:'):
                        title = line.replace('TITLE:', '').strip()
                    elif line.startswith('DESCRIPTION:'):
                        description = line.replace('DESCRIPTION:', '').strip()
                    elif line.startswith('IMPACT:'):
                        impact = line.replace('IMPACT:', '').strip()

                if title and description:
                    suggestions.append({
                        'priority': priority,
                        'title': title,
                        'description': description,
                        'impact': impact or 'Will improve overall site performance'
                    })

            except Exception as e:
                print(f"Error parsing suggestion: {e}")
                continue

        return suggestions
