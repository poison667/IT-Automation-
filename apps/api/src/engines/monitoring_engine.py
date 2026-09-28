import time
from typing import Dict, Any
import httpx

class MonitoringEngine:
    @staticmethod
    async def execute_probe(target_url: str, timeout_seconds: int = 10, region: str = "us-east-1") -> Dict[str, Any]:
        t0 = time.time()
        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        try:
            async with httpx.AsyncClient(timeout=float(timeout_seconds), follow_redirects=True) as client:
                resp = await client.get(target_url)
                latency_ms = int((time.time() - t0) * 1000)
                is_successful = 200 <= resp.status_code < 400
                
                return {
                    "target_url": target_url,
                    "region": region,
                    "status_code": resp.status_code,
                    "latency_ms": latency_ms,
                    "is_successful": is_successful,
                    "status": "HEALTHY" if is_successful and latency_ms < 500 else ("DEGRADED" if is_successful else "DOWN"),
                    "error_detail": None if is_successful else f"HTTP Status {resp.status_code}"
                }
        except Exception as e:
            latency_ms = int((time.time() - t0) * 1000)
            return {
                "target_url": target_url,
                "region": region,
                "status_code": 0,
                "latency_ms": latency_ms,
                "is_successful": False,
                "status": "DOWN",
                "error_detail": f"Network Error: {str(e)}"
            }
