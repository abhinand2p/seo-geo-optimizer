from anthropic import Anthropic
from typing import List, Dict, Optional
import asyncio
from app.core.config import settings

class ContentService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    TONES = {
        "neutral": "professional, informative, and straightforward",
        "poetic": "creative, metaphorical, and flowing with literary elegance",
        "engaging": "conversational, relatable, and captivating",
        "attention_grabbing": "bold, impactful, and hook-driven",
        "professional": "formal, authoritative, and business-oriented",
        "casual": "friendly, relaxed, and approachable",
        "inspirational": "motivating, uplifting, and aspirational",
        "humorous": "witty, light-hearted, and entertaining",
        "urgent": "time-sensitive, action-driven, and compelling",
        "empathetic": "compassionate, understanding, and supportive"
    }
    
    async def generate_seo_content(
        self,
        topic: str,
        keywords: List[str],
        tone: str = "neutral",
        content_type: str = "paragraph",
        word_count: int = 150
    ) -> Dict:
        """Generate SEO-optimized content"""
        
        tone_description = self.TONES.get(tone, self.TONES["neutral"])
        primary_keyword = keywords[0] if keywords else topic
        secondary_keywords = keywords[1:4] if len(keywords) > 1 else []
        
        if content_type == "headline":
            prompt = f"""Create a compelling, SEO-optimized headline for:

Topic: {topic}
Primary Keyword: {primary_keyword}
Tone: {tone_description}

Requirements:
- Include the primary keyword naturally
- 50-60 characters for optimal SEO
- {tone_description} tone
- Click-worthy and search-engine friendly
- Should rank well on Google

Generate 3 headline options, each on a new line."""

        elif content_type == "meta_description":
            prompt = f"""Write a meta description for:

Topic: {topic}
Primary Keyword: {primary_keyword}
Secondary Keywords: {', '.join(secondary_keywords)}
Tone: {tone_description}

Requirements:
- Exactly 150-160 characters
- Include primary keyword in first 120 characters
- Naturally incorporate 1-2 secondary keywords
- Compelling call-to-action
- Optimized for click-through rate (CTR)
- {tone_description} tone

Generate the meta description."""

        elif content_type == "paragraph":
            prompt = f"""Write an SEO-optimized paragraph for a webpage about:

Topic: {topic}
Primary Keyword: {primary_keyword}
Secondary Keywords: {', '.join(secondary_keywords)}
Target Length: {word_count} words
Tone: {tone_description}

SEO Requirements:
- Use primary keyword in the first sentence
- Naturally incorporate secondary keywords (keyword density 1-2%)
- Include semantic variations of keywords
- Write for readability (Flesch score 60+)
- Use active voice
- Break into 2-3 sentences for scanability
- {tone_description} tone
- Add internal linking opportunities (mention related topics)

Generate engaging, search-optimized content."""

        else:  # full_article
            prompt = f"""Write a comprehensive, SEO-optimized article about:

Topic: {topic}
Primary Keyword: {primary_keyword}
Secondary Keywords: {', '.join(secondary_keywords)}
Target Length: {word_count} words
Tone: {tone_description}

Structure Requirements:
- Compelling introduction with primary keyword
- Clear H2 and H3 subheadings (use keywords)
- 2-3 paragraphs per section
- Include statistics or data points (if applicable)
- Natural keyword integration (1-2% density)
- Conclusion with call-to-action
- {tone_description} tone throughout

SEO Optimization:
- Primary keyword in first 100 words
- Secondary keywords distributed naturally
- Semantic keyword variations
- Internal linking opportunities
- External citation opportunities
- Optimized for featured snippets

Generate the complete article with proper markdown formatting."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            content = message.content[0].text
            
            # Calculate SEO score
            seo_score = self._calculate_seo_score(content, keywords)
            
            return {
                "success": True,
                "content": content,
                "content_type": content_type,
                "tone": tone,
                "word_count": len(content.split()),
                "seo_score": seo_score,
                "primary_keyword": primary_keyword,
                "keywords_used": self._count_keywords(content, keywords)
            }
        
        except Exception as e:
            print(f"❌ Error generating SEO content: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_geo_content(
        self,
        topic: str,
        keywords: List[str],
        tone: str = "professional",
        content_type: str = "paragraph",
        word_count: int = 200
    ) -> Dict:
        """Generate GEO-optimized content (AI citation-worthy)"""
        
        tone_description = self.TONES.get(tone, self.TONES["professional"])
        primary_keyword = keywords[0] if keywords else topic
        
        if content_type == "definition":
            prompt = f"""Write an authoritative, cite-worthy definition for:

Topic: {topic}
Keyword: {primary_keyword}
Tone: {tone_description}

GEO Requirements:
- Start with a clear, concise definition
- Use factual, authoritative language
- Include context and background
- Add relevant statistics or research findings (if applicable)
- Write in a way that AI models would want to cite
- 100-150 words
- {tone_description} tone

Create content that ChatGPT, Claude, and Perplexity would quote."""

        elif content_type == "explanation":
            prompt = f"""Write a comprehensive explanation about:

Topic: {topic}
Primary Keyword: {primary_keyword}
Target Length: {word_count} words
Tone: {tone_description}

GEO Optimization:
- Start with "what it is" definition
- Explain "how it works"
- Include "why it matters"
- Use clear, structured format
- Add authoritative statements
- Include comparative analysis where relevant
- Use data/statistics to support claims
- Write content AI assistants would cite as source material
- {tone_description} tone

Generate cite-worthy, factual content."""

        elif content_type == "comparison":
            prompt = f"""Create a comparative analysis for:

Topic: {topic}
Keywords: {', '.join(keywords[:3])}
Target Length: {word_count} words
Tone: {tone_description}

Format:
- Clear comparison structure
- Objective analysis
- Key differences and similarities
- Use cases for each option
- Data-driven insights
- Authoritative conclusions
- {tone_description} tone

Optimize for AI model citations."""

        else:  # comprehensive guide
            prompt = f"""Write a comprehensive, cite-worthy guide about:

Topic: {topic}
Primary Keyword: {primary_keyword}
Secondary Keywords: {', '.join(keywords[1:4])}
Target Length: {word_count} words
Tone: {tone_description}

GEO Requirements:
- Authoritative introduction with clear definition
- Structured sections with clear headings
- Factual, data-driven content
- Expert-level insights
- Clear, actionable information
- Comparative analyses where relevant
- Statistical support
- Conclusion with key takeaways
- Write as a definitive source AI models would cite
- {tone_description} tone

Create the ultimate reference content."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=2500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            content = message.content[0].text
            
            # Calculate citeability score
            citeability_score = self._calculate_citeability_score(content)
            
            return {
                "success": True,
                "content": content,
                "content_type": content_type,
                "tone": tone,
                "word_count": len(content.split()),
                "citeability_score": citeability_score,
                "geo_optimized": True,
                "primary_keyword": primary_keyword
            }
        
        except Exception as e:
            print(f"❌ Error generating GEO content: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }
    
    def _calculate_seo_score(self, content: str, keywords: List[str]) -> int:
        """Calculate SEO score (0-100)"""
        score = 0
        content_lower = content.lower()
        word_count = len(content.split())
        
        # Keyword presence in content
        if keywords and keywords[0].lower() in content_lower[:200]:
            score += 25  # Primary keyword in first 200 chars
        
        # Keyword density check (1-2% is ideal)
        for kw in keywords[:3]:
            count = content_lower.count(kw.lower())
            density = (count * len(kw.split())) / word_count * 100 if word_count > 0 else 0
            if 1 <= density <= 2:
                score += 15
        
        # Content length
        if 100 <= word_count <= 300:
            score += 20
        elif word_count > 300:
            score += 15
        
        # Has call-to-action indicators
        cta_words = ['discover', 'learn', 'explore', 'find out', 'get started', 'read more']
        if any(word in content_lower for word in cta_words):
            score += 15
        
        # Readability (simple check - sentence length)
        sentences = content.split('.')
        avg_sentence_length = word_count / max(len(sentences), 1)
        if 15 <= avg_sentence_length <= 25:
            score += 10
        
        return min(score, 100)
    
    def _calculate_citeability_score(self, content: str) -> int:
        """Calculate how cite-worthy content is for AI models (0-100)"""
        score = 0
        content_lower = content.lower()
        
        # Has clear definitions
        if any(phrase in content_lower for phrase in ['is defined as', 'refers to', 'means that', 'is a']):
            score += 20
        
        # Contains data/statistics
        if any(char.isdigit() for char in content) and ('%' in content or 'percent' in content_lower):
            score += 20
        
        # Authoritative language
        authority_words = ['research shows', 'studies indicate', 'according to', 'evidence suggests', 'experts']
        if any(word in content_lower for word in authority_words):
            score += 20
        
        # Has structure (multiple paragraphs or bullet points)
        if content.count('\n\n') >= 2 or content.count('- ') >= 2:
            score += 15
        
        # Comparison or analysis
        if any(word in content_lower for word in ['compared to', 'versus', 'while', 'however', 'in contrast']):
            score += 15
        
        # Clear, factual tone (length check as proxy)
        word_count = len(content.split())
        if word_count >= 150:
            score += 10
        
        return min(score, 100)
    
    def _count_keywords(self, content: str, keywords: List[str]) -> Dict[str, int]:
        """Count keyword occurrences"""
        content_lower = content.lower()
        return {
            kw: content_lower.count(kw.lower())
            for kw in keywords[:5]  # Top 5 keywords
        }
    
    # ========== CONTENT OPTIMIZER METHODS ==========
    
    async def analyze_content(
        self,
        content: str,
        target_keywords: Optional[List[str]] = None
    ) -> Dict:
        """Analyze existing content for SEO/GEO optimization opportunities"""
        
        content_lower = content.lower()
        word_count = len(content.split())
        char_count = len(content)
        sentence_count = len([s for s in content.split('.') if s.strip()])
        paragraph_count = len([p for p in content.split('\n\n') if p.strip()])
        
        analysis = {
            "metrics": {
                "word_count": word_count,
                "character_count": char_count,
                "sentence_count": sentence_count,
                "paragraph_count": paragraph_count,
                "avg_sentence_length": word_count / max(sentence_count, 1),
                "reading_time_minutes": round(word_count / 200, 1)
            },
            "seo_issues": [],
            "geo_issues": [],
            "keyword_analysis": {},
            "readability": {},
            "suggestions": []
        }
        
        # SEO Analysis
        if word_count < 300:
            analysis["seo_issues"].append({
                "severity": "medium",
                "issue": "Content too short",
                "detail": f"Current: {word_count} words. Recommended: 300+ words for better SEO."
            })
        
        # Check for keyword presence
        if target_keywords:
            keyword_usage = {}
            for kw in target_keywords[:5]:
                count = content_lower.count(kw.lower())
                density = (count * len(kw.split())) / word_count * 100 if word_count > 0 else 0
                keyword_usage[kw] = {
                    "count": count,
                    "density": round(density, 2)
                }
                
                if count == 0:
                    analysis["seo_issues"].append({
                        "severity": "high",
                        "issue": f"Missing keyword: '{kw}'",
                        "detail": "Primary keywords should appear at least once in content."
                    })
                elif density < 0.5:
                    analysis["seo_issues"].append({
                        "severity": "low",
                        "issue": f"Low keyword density for '{kw}'",
                        "detail": f"Current: {density:.2f}%. Recommended: 1-2%"
                    })
                elif density > 3:
                    analysis["seo_issues"].append({
                        "severity": "high",
                        "issue": f"Keyword stuffing detected for '{kw}'",
                        "detail": f"Current: {density:.2f}%. Reduce to 1-2% for natural flow."
                    })
            
            analysis["keyword_analysis"] = keyword_usage
        
        # Readability Analysis
        avg_sentence_length = analysis["metrics"]["avg_sentence_length"]
        if avg_sentence_length > 25:
            analysis["readability"]["score"] = "difficult"
            analysis["seo_issues"].append({
                "severity": "medium",
                "issue": "Sentences too long",
                "detail": f"Avg: {avg_sentence_length:.1f} words. Keep under 20 for better readability."
            })
        elif avg_sentence_length > 20:
            analysis["readability"]["score"] = "moderate"
        else:
            analysis["readability"]["score"] = "easy"
        
        # Check for passive voice (simple check)
        passive_indicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am']
        passive_count = sum(content_lower.count(f' {word} ') for word in passive_indicators)
        if passive_count > word_count * 0.1:
            analysis["seo_issues"].append({
                "severity": "low",
                "issue": "Excessive passive voice",
                "detail": "Use more active voice for better engagement."
            })
        
        # GEO Analysis
        has_definition = any(phrase in content_lower for phrase in ['is defined as', 'refers to', 'means that'])
        if not has_definition:
            analysis["geo_issues"].append({
                "severity": "medium",
                "issue": "No clear definitions",
                "detail": "Add authoritative definitions to improve AI citeability."
            })
        
        has_data = any(char.isdigit() for char in content) and ('%' in content or 'percent' in content_lower)
        if not has_data:
            analysis["geo_issues"].append({
                "severity": "low",
                "issue": "No statistical data",
                "detail": "Include statistics or data points to increase authority."
            })
        
        if paragraph_count < 2:
            analysis["geo_issues"].append({
                "severity": "medium",
                "issue": "Poor structure",
                "detail": "Break content into multiple paragraphs with clear sections."
            })
        
        # Generate suggestions
        analysis["suggestions"] = self._generate_suggestions(analysis)
        
        # Overall scores
        analysis["seo_score"] = max(0, 100 - (len(analysis["seo_issues"]) * 15))
        analysis["geo_score"] = max(0, 100 - (len(analysis["geo_issues"]) * 20))
        
        return analysis

    async def optimize_content(
        self,
        original_content: str,
        target_keywords: List[str],
        optimization_type: str = "seo",
        preserve_meaning: bool = True,
        tone: str = "neutral"
    ) -> Dict:
        """Optimize existing content for SEO/GEO"""
        
        # First analyze the content
        analysis = await self.analyze_content(original_content, target_keywords)
        
        tone_description = self.TONES.get(tone, self.TONES["neutral"])
        primary_keyword = target_keywords[0] if target_keywords else ""
        secondary_keywords = target_keywords[1:5] if len(target_keywords) > 1 else []
        
        if optimization_type == "seo":
            result = await self._optimize_for_seo(
                original_content,
                primary_keyword,
                secondary_keywords,
                analysis,
                tone_description,
                preserve_meaning
            )
        elif optimization_type == "geo":
            result = await self._optimize_for_geo(
                original_content,
                primary_keyword,
                secondary_keywords,
                analysis,
                tone_description,
                preserve_meaning
            )
        else:  # both
            seo_result = await self._optimize_for_seo(
                original_content,
                primary_keyword,
                secondary_keywords,
                analysis,
                tone_description,
                preserve_meaning
            )
            geo_result = await self._optimize_for_geo(
                original_content,
                primary_keyword,
                secondary_keywords,
                analysis,
                tone_description,
                preserve_meaning
            )
            
            result = {
                "success": True,
                "seo_optimized": seo_result["optimized_content"],
                "geo_optimized": geo_result["optimized_content"],
                "seo_improvements": seo_result["improvements"],
                "geo_improvements": geo_result["improvements"],
                "seo_score_before": analysis["seo_score"],
                "geo_score_before": analysis["geo_score"],
                "seo_score_after": seo_result["score_after"],
                "geo_score_after": geo_result["score_after"]
            }
            return result
        
        return result

    async def _optimize_for_seo(
        self,
        content: str,
        primary_keyword: str,
        secondary_keywords: List[str],
        analysis: Dict,
        tone: str,
        preserve_meaning: bool
    ) -> Dict:
        """Optimize content specifically for SEO"""
        
        issues_summary = "\n".join([
            f"- {issue['issue']}: {issue['detail']}" 
            for issue in analysis["seo_issues"]
        ])
        
        preservation_instruction = "Keep the core message but rewrite for maximum optimization." if preserve_meaning else "Completely rewrite for maximum SEO impact."
        
        prompt = f"""You are an expert SEO content optimizer. Transform this content into HIGHLY SEO-optimized content that will rank #1 on Google.

ORIGINAL CONTENT (WEAK):
{content}

PRIMARY KEYWORD: {primary_keyword}
SECONDARY KEYWORDS: {', '.join(secondary_keywords)}

CURRENT ISSUES:
{issues_summary if issues_summary else "Content needs major SEO improvements."}

CRITICAL SEO REQUIREMENTS - MUST FOLLOW ALL:
1. Place "{primary_keyword}" in the FIRST 10 WORDS naturally
2. Use primary keyword 3-5 times throughout (1.5-2% density)
3. Use ALL secondary keywords at least twice each
4. Add power words: discover, proven, ultimate, essential, revolutionary, transform
5. Keep ALL sentences under 18 words (this is CRITICAL for readability)
6. Use ONLY active voice - eliminate all passive constructions
7. Add compelling transition words: however, moreover, therefore, consequently
8. Create urgency and engagement
9. Include specific numbers or statistics (even if example data)
10. Make it sound professional and authoritative with {tone} tone

{preservation_instruction}

MAKE IT SIGNIFICANTLY BETTER - not just slightly improved. The optimized version should be 3x more engaging and keyword-optimized.

Generate ONLY the optimized content. No explanations."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=3000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            optimized = message.content[0].text.strip()
            
            # Re-analyze optimized content
            new_analysis = await self.analyze_content(optimized, [primary_keyword] + secondary_keywords)
            
            # Identify improvements
            improvements = []
            
            score_gain = new_analysis["seo_score"] - analysis["seo_score"]
            if score_gain > 0:
                improvements.append(f"SEO score improved by +{score_gain} points ({analysis['seo_score']} → {new_analysis['seo_score']})")
            
            word_gain = new_analysis["metrics"]["word_count"] - analysis["metrics"]["word_count"]
            if word_gain > 0:
                improvements.append(f"Expanded content by {word_gain} words for better depth")
            
            # Check keyword improvements
            for kw in [primary_keyword] + secondary_keywords[:3]:
                old_density = analysis.get("keyword_analysis", {}).get(kw, {}).get("density", 0)
                new_density = new_analysis.get("keyword_analysis", {}).get(kw, {}).get("density", 0)
                if new_density > old_density:
                    improvements.append(f"Improved '{kw}' density from {old_density:.1f}% to {new_density:.1f}%")
            
            # Check readability
            if new_analysis["readability"].get("score") == "easy" and analysis["readability"].get("score") != "easy":
                improvements.append("Significantly improved readability for better user experience")
            
            if not improvements:
                improvements.append("Content structure and flow optimized for search engines")
            
            return {
                "success": True,
                "optimized_content": optimized,
                "original_word_count": analysis["metrics"]["word_count"],
                "optimized_word_count": new_analysis["metrics"]["word_count"],
                "score_before": analysis["seo_score"],
                "score_after": new_analysis["seo_score"],
                "improvements": improvements,
                "keyword_analysis": new_analysis["keyword_analysis"]
            }
        
        except Exception as e:
            print(f"Error optimizing for SEO: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    async def _optimize_for_geo(
        self,
        content: str,
        primary_keyword: str,
        secondary_keywords: List[str],
        analysis: Dict,
        tone: str,
        preserve_meaning: bool
    ) -> Dict:
        """Optimize content specifically for GEO (AI citation)"""
        
        issues_summary = "\n".join([
            f"- {issue['issue']}: {issue['detail']}" 
            for issue in analysis["geo_issues"]
        ])
        
        preservation_instruction = "Preserve the core facts and message." if preserve_meaning else "You can restructure significantly to improve AI citeability."
        
        prompt = f"""You are an expert in GEO (Generative Engine Optimization). Transform this content to be highly cite-worthy for AI assistants like ChatGPT, Claude, and Perplexity.

ORIGINAL CONTENT:
{content}

PRIMARY KEYWORD: {primary_keyword}
SECONDARY KEYWORDS: {', '.join(secondary_keywords)}

CURRENT ISSUES:
{issues_summary if issues_summary else "Content has good GEO potential."}

GEO OPTIMIZATION REQUIREMENTS:
1. Start with a clear, authoritative definition of {primary_keyword}
2. Use factual, evidence-based language
3. Include specific data, statistics, or research findings (use realistic examples)
4. Structure with clear sections and subheadings
5. Add comparative analysis where relevant
6. Use phrases like "research shows", "according to", "evidence suggests"
7. Create quotable snippets (standalone statements AI can cite)
8. Include context and background information
9. Add expert-level insights
10. Maintain {tone} tone while being authoritative

{preservation_instruction}

FORMAT:
- Use clear paragraph breaks
- Add markdown headings (## and ###) for structure
- Create standalone, quotable statements
- Include attribution-friendly language

The goal is to create content that AI models would confidently cite as a reliable source.

Generate ONLY the optimized content. Do not include explanations."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=2500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            optimized = message.content[0].text.strip()
            
            # Calculate new citeability score
            new_score = self._calculate_citeability_score(optimized)
            
            # Identify improvements
            improvements = []
            if new_score > analysis["geo_score"]:
                improvements.append(f"Citeability score improved from {analysis['geo_score']} to {new_score}")
            
            if '##' in optimized:
                improvements.append("Added clear structure with headings")
            
            if any(phrase in optimized.lower() for phrase in ['research shows', 'according to', 'studies indicate']):
                improvements.append("Increased authoritative language")
            
            if any(char.isdigit() for char in optimized):
                improvements.append("Added data and statistics")
            
            return {
                "success": True,
                "optimized_content": optimized,
                "original_word_count": analysis["metrics"]["word_count"],
                "optimized_word_count": len(optimized.split()),
                "score_before": analysis["geo_score"],
                "score_after": new_score,
                "improvements": improvements
            }
        
        except Exception as e:
            print(f"Error optimizing for GEO: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    def _generate_suggestions(self, analysis: Dict) -> List[str]:
        """Generate actionable suggestions based on analysis"""
        suggestions = []
        
        # Word count suggestions
        word_count = analysis["metrics"]["word_count"]
        if word_count < 300:
            suggestions.append(f"Expand content to at least 300 words (current: {word_count})")
        elif word_count > 2000:
            suggestions.append("Consider breaking into multiple pages or sections")
        
        # Keyword suggestions
        if analysis["keyword_analysis"]:
            for kw, data in analysis["keyword_analysis"].items():
                if data["count"] == 0:
                    suggestions.append(f"Add keyword '{kw}' naturally throughout content")
                elif data["density"] > 3:
                    suggestions.append(f"Reduce '{kw}' usage - appears too often ({data['density']:.1f}%)")
        
        # Readability
        if analysis["readability"].get("score") == "difficult":
            suggestions.append("Break long sentences into shorter ones (aim for 15-20 words)")
        
        # Structure
        if analysis["metrics"]["paragraph_count"] < 3:
            suggestions.append("Add more paragraphs for better readability")
        
        # SEO specific
        if len(analysis["seo_issues"]) > 5:
            suggestions.append("Focus on top 3 SEO issues first for quick wins")
        
        # GEO specific
        if len(analysis["geo_issues"]) > 3:
            suggestions.append("Add authoritative sources and data to improve AI citeability")
        
        return suggestions[:8]  # Return top 8 suggestions