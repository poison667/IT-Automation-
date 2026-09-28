import socket
import ssl
import datetime
import time
from typing import Dict, Any, List
import httpx

class SecurityEngine:
    @staticmethod
    async def analyze_tls_certificate(target_host: str, port: int = 443) -> Dict[str, Any]:
        start_time = time.time()
        clean_host = target_host.replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]
        
        context = ssl.create_default_context()
        try:
            with socket.create_connection((clean_host, port), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=clean_host) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    tls_version = ssock.version()
        except Exception as e:
            return {
                "target_host": clean_host,
                "port": port,
                "status": "FAILED",
                "error": f"TLS Connection failed: {str(e)}",
                "grade": "F"
            }

        # Parse Expiry
        not_after_str = cert.get("notAfter", "")
        # format: 'May 28 12:00:00 2027 GMT'
        try:
            expiry_dt = datetime.datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z")
            days_remaining = (expiry_dt - datetime.datetime.utcnow()).days
        except Exception:
            days_remaining = 365
            expiry_dt = datetime.datetime.utcnow() + datetime.timedelta(days=365)

        # Subject & Issuer
        subject = dict(x[0] for x in cert.get("subject", []))
        issuer = dict(x[0] for x in cert.get("issuer", []))
        sans = [x[1] for x in cert.get("subjectAltName", [])]

        grade = "A+"
        if days_remaining < 14: grade = "C"
        elif days_remaining < 30: grade = "B"
        if tls_version in ["TLSv1", "TLSv1.1"]: grade = "F"

        return {
            "target_host": clean_host,
            "port": port,
            "grade": grade,
            "tls_version": tls_version,
            "cipher_suite": cipher[0] if cipher else "Unknown",
            "cipher_bits": cipher[2] if cipher else 256,
            "certificate": {
                "common_name": subject.get("commonName", clean_host),
                "issuer_org": issuer.get("organizationName", "Trusted CA"),
                "expiry_date": expiry_dt.strftime("%Y-%m-%d"),
                "days_remaining": max(0, days_remaining),
                "is_expired": days_remaining <= 0,
                "subject_alt_names": sans[:5]
            },
            "duration_seconds": round(time.time() - start_time, 2)
        }

    @staticmethod
    async def analyze_security_headers(target_url: str) -> Dict[str, Any]:
        start_time = time.time()
        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        try:
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(target_url)
                headers = {k.lower(): v for k, v in resp.headers.items()}
        except Exception as e:
            return {
                "target_url": target_url,
                "security_score": 0,
                "error": str(e),
                "headers_evaluated": []
            }

        headers_check = [
            {
                "name": "Strict-Transport-Security (HSTS)",
                "key": "strict-transport-security",
                "present": "strict-transport-security" in headers,
                "value": headers.get("strict-transport-security", "Missing"),
                "importance": "CRITICAL",
                "recommendation": "Set 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'"
            },
            {
                "name": "Content-Security-Policy (CSP)",
                "key": "content-security-policy",
                "present": "content-security-policy" in headers,
                "value": (headers.get("content-security-policy", "Missing")[:50] + "...") if "content-security-policy" in headers else "Missing",
                "importance": "CRITICAL",
                "recommendation": "Configure a restrictive Content-Security-Policy to mitigate XSS attacks."
            },
            {
                "name": "X-Frame-Options",
                "key": "x-frame-options",
                "present": "x-frame-options" in headers,
                "value": headers.get("x-frame-options", "Missing"),
                "importance": "HIGH",
                "recommendation": "Set 'X-Frame-Options: DENY' or 'SAMEORIGIN' to prevent clickjacking."
            },
            {
                "name": "X-Content-Type-Options",
                "key": "x-content-type-options",
                "present": "x-content-type-options" in headers,
                "value": headers.get("x-content-type-options", "Missing"),
                "importance": "HIGH",
                "recommendation": "Set 'X-Content-Type-Options: nosniff' to block MIME-sniffing."
            },
            {
                "name": "Referrer-Policy",
                "key": "referrer-policy",
                "present": "referrer-policy" in headers,
                "value": headers.get("referrer-policy", "Missing"),
                "importance": "MEDIUM",
                "recommendation": "Set 'Referrer-Policy: strict-origin-when-cross-origin'."
            }
        ]

        present_count = sum(1 for h in headers_check if h["present"])
        score = int((present_count / len(headers_check)) * 100)

        return {
            "target_url": target_url,
            "security_score": score,
            "headers_present_ratio": f"{present_count}/{len(headers_check)}",
            "headers_evaluated": headers_check,
            "duration_seconds": round(time.time() - start_time, 2)
        }
