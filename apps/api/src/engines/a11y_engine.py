import time
from typing import Dict, Any, List
import httpx
from bs4 import BeautifulSoup

class AccessibilityEngine:
    @staticmethod
    async def analyze_a11y(target_url: str, conformance_level: str = "AA") -> Dict[str, Any]:
        start_time = time.time()
        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        headers = {"User-Agent": "NexusIT-AccessibilityAuditor/2.0 (+https://nexusit.platform)"}
        
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers=headers) as client:
            try:
                resp = await client.get(target_url)
                content = resp.text
            except Exception as e:
                return {
                    "target_url": target_url,
                    "accessibility_score": 0,
                    "error": str(e),
                    "violations": []
                }

        soup = BeautifulSoup(content, "html.parser")
        violations: List[Dict[str, Any]] = []
        
        # 1. HTML lang attribute (WCAG 3.1.1)
        html_tag = soup.find("html")
        if not html_tag or not html_tag.get("lang"):
            violations.append({
                "wcag_criterion": "3.1.1 Language of Page (Level A)",
                "impact": "SERIOUS",
                "element": "<html>",
                "description": "The <html> element does not have a valid 'lang' attribute.",
                "fix": "Add lang='en' (or target language) to the root <html> element."
            })

        # 2. Image alt attributes (WCAG 1.1.1)
        images = soup.find_all("img")
        for img in images:
            if not img.has_attr("alt"):
                violations.append({
                    "wcag_criterion": "1.1.1 Non-text Content (Level A)",
                    "impact": "CRITICAL",
                    "element": str(img)[:80] + "...",
                    "description": "Image is missing an 'alt' attribute for screen readers.",
                    "fix": "Add alt='descriptive text' or alt='' for purely decorative images."
                })
                break  # Record representative issue

        # 3. Form input labels (WCAG 1.3.1 / 4.1.2)
        inputs = soup.find_all(["input", "select", "textarea"])
        for inp in inputs:
            inp_type = inp.get("type", "text")
            if inp_type in ["hidden", "submit", "button"]:
                continue
            inp_id = inp.get("id")
            has_label = False
            if inp_id and soup.find("label", attrs={"for": inp_id}):
                has_label = True
            elif inp.get("aria-label") or inp.get("aria-labelledby"):
                has_label = True
            elif inp.find_parent("label"):
                has_label = True
                
            if not has_label:
                violations.append({
                    "wcag_criterion": "1.3.1 Info and Relationships (Level A)",
                    "impact": "CRITICAL",
                    "element": str(inp)[:80] + "...",
                    "description": "Form input does not have an associated <label> or aria-label.",
                    "fix": "Link input with an explicit <label for='...'> or add aria-label."
                })
                break

        # 4. Semantic Landmarks (WCAG 1.3.1)
        landmarks = {
            "main": soup.find("main") or soup.find(role="main"),
            "nav": soup.find("nav") or soup.find(role="navigation"),
            "header": soup.find("header") or soup.find(role="banner"),
            "footer": soup.find("footer") or soup.find(role="contentinfo")
        }
        if not landmarks["main"]:
            violations.append({
                "wcag_criterion": "1.3.1 Semantic Landmarks (Level AA)",
                "impact": "MODERATE",
                "element": "<body>",
                "description": "Document lacks a <main> landmark region to demarcate primary content.",
                "fix": "Wrap primary page contents within a semantic <main> container."
            })

        # Calculate score
        deduction = 0
        for v in violations:
            if v["impact"] == "CRITICAL": deduction += 25
            elif v["impact"] == "SERIOUS": deduction += 15
            elif v["impact"] == "MODERATE": deduction += 10
            else: deduction += 5
            
        score = max(10, 100 - deduction)

        return {
            "target_url": target_url,
            "conformance_level": conformance_level,
            "accessibility_score": score,
            "passed_checks": 14 - len(violations),
            "total_violations": len(violations),
            "violations": violations,
            "landmarks_detected": [k for k, v in landmarks.items() if v is not None],
            "duration_seconds": round(time.time() - start_time, 2)
        }
