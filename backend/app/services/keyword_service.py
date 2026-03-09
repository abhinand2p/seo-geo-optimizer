from anthropic import Anthropic
from typing import List, Dict
import asyncio
import json
import re
from app.core.config import settings

class KeywordService:
    def __init__(self):
        print(f"🔧 Initializing KeywordService with API key: {settings.ANTHROPIC_API_KEY[:20]}...")
        try:
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            print("✅ Anthropic client initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Anthropic client: {e}")
            raise

    async def generate_seed_keywords(
        self,
        topic: str,
        industry: str,
        count: int = 30
    ) -> List[str]:
        """Generate initial keyword ideas using Claude"""

        prompt = f"""You are an expert SEO keyword researcher. Generate {count} highly relevant keywords for:

Topic: {topic}
Industry: {industry}

Create a diverse mix:
- Short-tail keywords (1-2 words)
- Long-tail keywords (3-5 words)
- Question keywords (how, what, why, when)
- Commercial intent (best, top, review, buy)
- Informational intent

Return ONLY a comma-separated list of keywords, nothing else."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )

            keywords_text = message.content[0].text
            keywords = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
            return keywords[:count]

        except Exception as e:
            print(f"❌ Error generating keywords: {e}")
            import traceback
            traceback.print_exc()
            return []

    def analyze_keyword(self, keyword: str) -> Dict:
        """Analyze a single keyword with rule-based heuristics"""
        keyword_lower = keyword.lower()
        word_count = len(keyword.split())

        intent = "Navigational"
        if any(word in keyword_lower for word in ['how', 'what', 'why', 'when', 'where', 'who']):
            intent = "Informational"
        elif any(word in keyword_lower for word in ['best', 'top', 'review', 'comparison', 'vs']):
            intent = "Commercial"
        elif any(word in keyword_lower for word in ['buy', 'purchase', 'price', 'cheap', 'discount']):
            intent = "Transactional"

        if word_count >= 4:
            difficulty = "Easy"
        elif word_count == 3:
            difficulty = "Medium"
        else:
            difficulty = "Hard"

        return {
            "keyword": keyword,
            "word_count": word_count,
            "intent": intent,
            "difficulty": difficulty,
            "character_length": len(keyword),
            "volume_estimate": self._estimate_volume(word_count),
            "cpc_estimate": self._estimate_cpc(intent),
            "trend": "Stable",
            "competition_level": self._estimate_competition(difficulty),
        }

    def _estimate_volume(self, word_count: int) -> str:
        if word_count == 1:
            return "10K-100K"
        elif word_count == 2:
            return "1K-10K"
        elif word_count == 3:
            return "100-1K"
        else:
            return "100-1K"

    def _estimate_cpc(self, intent: str) -> str:
        if intent == "Transactional":
            return "$1-$3"
        elif intent == "Commercial":
            return "$0.50-$1"
        else:
            return "$0.10-$0.50"

    def _estimate_competition(self, difficulty: str) -> str:
        if difficulty == "Hard":
            return "High"
        elif difficulty == "Medium":
            return "Medium"
        else:
            return "Low"

    async def analyze_keywords_batch(
        self,
        keywords: List[str],
        industry: str
    ) -> List[Dict]:
        """
        Send all keywords to Claude in ONE call for richer AI-estimated metrics.
        Falls back to rule-based analysis if Claude JSON parsing fails.
        """
        if not keywords:
            return []

        rule_based = [self.analyze_keyword(kw) for kw in keywords]

        prompt = f"""You are an SEO data analyst. Estimate realistic metrics for these keywords in the {industry} industry.

Keywords: {', '.join(keywords)}

For each keyword provide estimated values. Use ONLY these exact values:
- volume_estimate: "100-1K" | "1K-10K" | "10K-100K" | "100K+"
- cpc_estimate: "$0.10-$0.50" | "$0.50-$1" | "$1-$3" | "$3-$10" | "$10+"
- trend: "Rising" | "Stable" | "Declining"
- competition_level: "Low" | "Medium" | "High"

Return ONLY a valid JSON array. No markdown, no explanation:
[{{"keyword": "...", "volume_estimate": "...", "cpc_estimate": "...", "trend": "...", "competition_level": "..."}}]"""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            raw = message.content[0].text.strip()
            # Strip markdown code fences if present
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw)
            raw = raw.strip()

            ai_data = json.loads(raw)
            ai_map = {item["keyword"].lower(): item for item in ai_data}

            # Merge AI estimates into rule-based results
            merged = []
            for rb in rule_based:
                kw_lower = rb["keyword"].lower()
                ai = ai_map.get(kw_lower, {})
                merged.append({
                    **rb,
                    "volume_estimate": ai.get("volume_estimate", rb["volume_estimate"]),
                    "cpc_estimate": ai.get("cpc_estimate", rb["cpc_estimate"]),
                    "trend": ai.get("trend", rb["trend"]),
                    "competition_level": ai.get("competition_level", rb["competition_level"]),
                })
            return merged

        except Exception as e:
            print(f"⚠️ Batch analysis failed, using rule-based fallback: {e}")
            return rule_based

    async def generate_geo_keywords(
        self,
        topic: str,
        count: int = 20
    ) -> List[str]:
        """Generate keywords optimized for AI chatbot indexing (GEO)"""

        prompt = f"""Generate {count} keywords optimized for Generative AI Engines (ChatGPT, Claude, Perplexity).

Topic: {topic}

Focus on phrases that AI models would cite when answering questions:
- Authoritative, factual phrases
- Definition-style keywords
- Statistical/data keywords
- Comparative analysis terms
- Expert opinion phrases
- Use case scenarios

These should be cite-worthy content topics that AI assistants would reference.

Return ONLY a comma-separated list."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )

            keywords_text = message.content[0].text
            keywords = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
            return keywords[:count]

        except Exception as e:
            print(f"❌ Error generating GEO keywords: {e}")
            import traceback
            traceback.print_exc()
            return []

    async def generate_question_keywords(
        self,
        topic: str,
        industry: str,
        count: int = 20
    ) -> List[str]:
        """Generate question-based keywords (how to, what is, why, which)"""

        prompt = f"""You are an SEO keyword researcher. Generate {count} question-based keywords for:

Topic: {topic}
Industry: {industry}

Include a mix of:
- "How to" questions (how to use, how to choose, how to fix...)
- "What is/are" questions (what is, what are, what does...)
- "Why" questions (why is, why does, why use...)
- "Which/When/Where" questions

Return ONLY a comma-separated list of question keywords, nothing else."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=800,
                messages=[{"role": "user", "content": prompt}]
            )

            text = message.content[0].text
            questions = [q.strip() for q in text.split(',') if q.strip()]
            return questions[:count]

        except Exception as e:
            print(f"❌ Error generating question keywords: {e}")
            import traceback
            traceback.print_exc()
            return []

    async def generate_competitor_keywords(
        self,
        competitor_domain: str,
        your_topic: str,
        industry: str,
        count: int = 25
    ) -> Dict:
        """
        Infer keywords a competitor likely targets based on their domain name.
        No live crawling — purely AI-inferred.
        """

        # Clean domain for display
        domain = competitor_domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]

        prompt = f"""You are an SEO competitive intelligence analyst.

Competitor domain: {domain}
Industry: {industry}
Context topic: {your_topic}

Based on the domain name and industry alone (no live data), infer {count} keywords this competitor likely targets.
Also identify 10 content gap keywords — topics they likely cover that you should also target.

Return in EXACTLY this format with no extra text:
KEYWORDS: keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8, keyword9, keyword10
GAPS: gap1, gap2, gap3, gap4, gap5, gap6, gap7, gap8, gap9, gap10"""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )

            text = message.content[0].text.strip()

            inferred_keywords = []
            content_gaps = []

            for line in text.split('\n'):
                line = line.strip()
                if line.upper().startswith('KEYWORDS:'):
                    raw = line[len('KEYWORDS:'):].strip()
                    inferred_keywords = [k.strip() for k in raw.split(',') if k.strip()]
                elif line.upper().startswith('GAPS:'):
                    raw = line[len('GAPS:'):].strip()
                    content_gaps = [k.strip() for k in raw.split(',') if k.strip()]

            return {
                "inferred_keywords": inferred_keywords[:count],
                "content_gaps": content_gaps[:10],
            }

        except Exception as e:
            print(f"❌ Error generating competitor keywords: {e}")
            import traceback
            traceback.print_exc()
            return {"inferred_keywords": [], "content_gaps": []}

    async def cluster_keywords(
        self,
        keywords: List[str],
        topic: str,
        max_clusters: int = 5
    ) -> Dict:
        """Group keywords into thematic topic clusters"""

        prompt = f"""You are an SEO content strategist. Group these keywords into thematic topic clusters.

Keywords: {', '.join(keywords)}
Topic: {topic}
Maximum clusters: {max_clusters}

Group related keywords. Each cluster needs a clear theme and a primary keyword.

Return ONLY valid JSON, no markdown, no explanation:
{{
  "clusters": [
    {{
      "cluster_name": "Short descriptive name",
      "theme": "One sentence explaining this cluster topic",
      "primary_keyword": "the most important keyword in this cluster",
      "intent": "Informational",
      "keywords": ["kw1", "kw2", "kw3"]
    }}
  ],
  "unclustered": ["any keywords that did not fit"]
}}"""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )

            raw = message.content[0].text.strip()
            raw = re.sub(r'^```[a-z]*\n?', '', raw)
            raw = re.sub(r'\n?```$', '', raw)
            raw = raw.strip()

            data = json.loads(raw)
            return {
                "clusters": data.get("clusters", []),
                "unclustered": data.get("unclustered", []),
            }

        except Exception as e:
            print(f"⚠️ Cluster parsing failed: {e}")
            # Fallback: put all keywords in one cluster
            return {
                "clusters": [{
                    "cluster_name": topic,
                    "theme": f"All keywords related to {topic}",
                    "primary_keyword": keywords[0] if keywords else "",
                    "intent": "Informational",
                    "keywords": keywords,
                }],
                "unclustered": [],
            }

    async def expand_keyword(
        self,
        seed_keyword: str,
        variations: int = 5
    ) -> List[str]:
        """Expand a keyword with semantic variations"""

        prompt = f"""Generate {variations} semantic variations of this keyword: "{seed_keyword}"

Requirements:
- Similar search intent
- Use synonyms or related terms
- Maintain relevance
- Natural phrasing

Return ONLY a comma-separated list."""

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-haiku-20240307",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}]
            )

            expanded_text = message.content[0].text
            expanded = [kw.strip() for kw in expanded_text.split(',') if kw.strip()]
            return expanded[:variations]

        except Exception as e:
            print(f"❌ Error expanding keyword: {e}")
            import traceback
            traceback.print_exc()
            return []
