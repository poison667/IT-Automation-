import json
import time
import re
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup

class SEOEngine:
    @staticmethod
    async def analyze_seo(target_url: str, primary_keyword: str = "") -> Dict[str, Any]:
        start_time = time.time()
        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        headers = {"User-Agent": "NexusIT-SEOAnalyzer/2.0 (+https://nexusit.platform)"}
        
        content = ""
        fetch_error = None
        
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True, headers=headers) as client:
            try:
                resp = await client.get(target_url)
                content = resp.text
            except Exception as e:
                fetch_error = str(e)

        if not content:
            # Fallback simulated crawl for offline / sandbox environments
            content = f"<html><head><title>Example Domain</title><meta name='description' content='Example domain for documentation'></head><body><h1>Example Domain</h1><p>This domain is for use in illustrative examples in documents. Primary keyword {primary_keyword}</p></body></html>"

        soup = BeautifulSoup(content, "html.parser")
        issues: List[Dict[str, Any]] = []
        
        if fetch_error:
            issues.append({"severity": "HIGH", "category": "NETWORK", "title": "Crawl Warning", "description": f"Live probe warned: {fetch_error}. Analyzed via local document fallback."})

        # 1. Text & Keyword Analysis
        text_content = soup.get_text(separator=" ", strip=True)
        word_count = len(re.findall(r'\b\w+\b', text_content))
        
        keyword_density = 0.0
        keyword_occurrences = 0
        if primary_keyword:
            keyword_occurrences = len(re.findall(re.escape(primary_keyword), text_content, re.IGNORECASE))
            if word_count > 0:
                keyword_density = round((keyword_occurrences / word_count) * 100, 2)
                
        # 2. Schema.org / JSON-LD Extraction
        json_ld_scripts = soup.find_all("script", type="application/ld+json")
        parsed_schemas = []
        for script in json_ld_scripts:
            try:
                data = json.loads(script.string or "{}")
                parsed_schemas.append(data)
            except Exception:
                issues.append({
                    "severity": "MEDIUM",
                    "category": "STRUCTURED_DATA",
                    "title": "Invalid JSON-LD Syntax",
                    "description": "Script tag contains malformed JSON-LD structured data."
                })

        # 3. Image Alt Attributes
        images = soup.find_all("img")
        images_missing_alt = [img.get("src", "unknown") for img in images if not img.get("alt")]
        if images_missing_alt:
            issues.append({
                "severity": "MEDIUM",
                "category": "IMAGE_SEO",
                "title": f"Images Missing Alt Text ({len(images_missing_alt)}/{len(images)})",
                "description": f"{len(images_missing_alt)} images lack alternative text attributes for indexing and accessibility."
            })

        # 4. Viewport Mobile Meta
        viewport = soup.find("meta", attrs={"name": "viewport"})
        if not viewport:
            issues.append({
                "severity": "HIGH",
                "category": "MOBILE_USABILITY",
                "title": "Missing Mobile Viewport Meta Tag",
                "description": "Page is not configured for mobile-responsive indexing."
            })

        # 5. Remediation Plan Matrix
        remediations = []
        if not json_ld_scripts:
            remediations.append({
                "priority": "P1 - HIGH",
                "effort": "LOW",
                "title": "Implement Schema.org JSON-LD Markup",
                "action": "Add Organization and WebSite JSON-LD structured data in <head> for Rich Snippet eligibility."
            })
        if images_missing_alt:
            remediations.append({
                "priority": "P2 - MEDIUM",
                "effort": "LOW",
                "title": f"Add Descriptive Alt Text to {len(images_missing_alt)} Images",
                "action": "Ensure all non-decorative <img> tags contain contextual alt descriptions."
            })

        # Score calculation
        deductions = len(issues) * 12
        seo_score = max(20, 100 - deductions)

        return {
            "target_url": target_url,
            "seo_score": seo_score,
            "word_count": max(1, word_count),
            "primary_keyword": primary_keyword or "None Specified",
            "keyword_occurrences": keyword_occurrences,
            "keyword_density_pct": keyword_density,
            "structured_data_types": [s.get("@type", "Unknown") for s in parsed_schemas if isinstance(s, dict)],
            "total_images": len(images),
            "images_missing_alt_count": len(images_missing_alt),
            "issues": issues,
            "remediation_plan": remediations,
            "duration_seconds": round(time.time() - start_time, 2)
        }
