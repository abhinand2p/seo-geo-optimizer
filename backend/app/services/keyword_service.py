from anthropic import Anthropic
from typing import List, Dict
import asyncio
from app.core.config import settings

class KeywordService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
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
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            keywords_text = message.content[0].text
            keywords = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
            
            return keywords[:count]
        
        except Exception as e:
            print(f"❌ Error generating keywords: {e}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return []
    
    def analyze_keyword(self, keyword: str) -> Dict:
        """Analyze a single keyword"""
        
        keyword_lower = keyword.lower()
        word_count = len(keyword.split())
        
        # Classify intent
        intent = "Navigational"
        if any(word in keyword_lower for word in ['how', 'what', 'why', 'when', 'where', 'who']):
            intent = "Informational"
        elif any(word in keyword_lower for word in ['best', 'top', 'review', 'comparison', 'vs']):
            intent = "Commercial"
        elif any(word in keyword_lower for word in ['buy', 'purchase', 'price', 'cheap', 'discount']):
            intent = "Transactional"
        
        # Estimate difficulty (simple version)
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
            "character_length": len(keyword)
        }
    
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
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            keywords_text = message.content[0].text
            keywords = [kw.strip() for kw in keywords_text.split(',') if kw.strip()]
            
            return keywords[:count]
        
        except Exception as e:
            print(f"❌ Error generating GEO keywords: {e}")
            import traceback
            traceback.print_exc()
            return []
    
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
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            expanded_text = message.content[0].text
            expanded = [kw.strip() for kw in expanded_text.split(',') if kw.strip()]
            
            return expanded[:variations]
        
        except Exception as e:
            print(f"❌ Error expanding keyword: {e}")
            import traceback
            traceback.print_exc()
            return []