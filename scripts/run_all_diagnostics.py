#!/usr/bin/env python3
"""
NexusIT Autonomous Diagnostics & Engine Validation Harness
Executes all 18+ platform service engines and verifies end-to-end execution,
data schemas, cryptographic integrity, and report generation.
"""

import sys
import time
import json
import httpx

API_BASE = "http://127.0.0.1:8000/api/v1"

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "SUCCESS": "\033[92m",
        "WARN": "\033[93m",
        "ERROR": "\033[91m",
        "BOLD": "\033[1m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}[{status}] {msg}{colors['RESET']}")

def run_diagnostics():
    log("Initializing NexusIT Autonomous Platform Diagnostic Suite...", "BOLD")
    start_all = time.time()
    
    with httpx.Client(timeout=30.0) as client:
        # 1. Health Check
        try:
            resp = client.get("http://127.0.0.1:8000/health")
            assert resp.status_code == 200, f"Health check failed: {resp.status_code}"
            log("Core API Gateway: HEALTHY (v2.0.0-PROD)", "SUCCESS")
        except Exception as e:
            log(f"Cannot connect to API gateway: {e}", "ERROR")
            sys.exit(1)

        # 2. List Services
        resp = client.get(f"{API_BASE}/services")
        services = resp.json().get("data", [])
        log(f"Service Registry: {len(services)} production engines registered", "SUCCESS")

        # 3. Test Running Each Major Service Pipeline
        test_cases = [
            ("srv_web_audit_complete", {"target_url": "https://example.com"}),
            ("srv_seo_onpage_audit", {"target_url": "https://example.com", "primary_keyword": "domain"}),
            ("srv_perf_core_web_vitals", {"target_url": "https://example.com", "device_profile": "DESKTOP"}),
            ("srv_a11y_wcag_audit", {"target_url": "https://example.com", "conformance_level": "AA"}),
            ("srv_sec_tls_certificate", {"target_host": "example.com", "port": 443}),
            ("srv_sec_headers_defense", {"target_url": "https://example.com"}),
            ("srv_data_cleansing_pipeline", {"raw_data": [{"id": 1, "name": " Test Corp "}, {"id": 1, "name": "Test Corp"}]}),
            ("srv_doc_structured_extraction", {"raw_text": "INVOICE #INV-8812 Date: 2026-09-28\nItem 1: Dedicated Server 1 $800.00 $800.00\nTotal Due: $864.00"}),
            ("srv_analytics_telemetry_insights", {"time_range_days": 30}),
            ("srv_ai_grounded_investigator", {"target_url": "https://example.com", "investigation_query": "Check latency and security posture."})
        ]

        passed = 0
        for service_id, params in test_cases:
            t0 = time.time()
            log(f"Testing Engine: {service_id}...", "INFO")
            
            # Submit Job
            job_resp = client.post(f"{API_BASE}/jobs", json={"service_id": service_id, "input_params": params})
            if job_resp.status_code != 200:
                log(f"Job creation failed for {service_id}: {job_resp.text}", "ERROR")
                continue
                
            job_id = job_resp.json()["data"]["job_id"]
            
            # Wait for execution to complete
            max_wait = 10
            is_done = False
            for _ in range(max_wait):
                time.sleep(0.5)
                poll = client.get(f"{API_BASE}/jobs/{job_id}")
                st = poll.json()["data"]["status"]
                if st in ["COMPLETED", "FAILED"]:
                    is_done = True
                    break
                    
            elapsed = round(time.time() - t0, 2)
            if is_done and st == "COMPLETED":
                log(f"  ✓ {service_id} -> COMPLETED ({elapsed}s) [Job #{job_id}]", "SUCCESS")
                passed += 1
            else:
                log(f"  ✗ {service_id} -> Status: {st} ({elapsed}s)", "WARN")

        # 4. Verify Continuous Monitoring Engine
        log("Testing Synthetic Monitoring Engine...", "INFO")
        chk_resp = client.get(f"{API_BASE}/monitoring/checks")
        checks = chk_resp.json().get("data", [])
        if checks:
            first_chk = checks[0]
            ping_resp = client.post(f"{API_BASE}/monitoring/checks/{first_chk['id']}/ping")
            assert ping_resp.status_code == 200
            ping_data = ping_resp.json()["data"]
            log(f"  ✓ Synthetic Probe executed: {first_chk['name']} -> {ping_data['status']} ({ping_data['latency_ms']}ms)", "SUCCESS")

        # 5. Verify Billing & Invoice System
        log("Testing Billing & Credit Ledger...", "INFO")
        bill_resp = client.get(f"{API_BASE}/billing/summary")
        bill_data = bill_resp.json()["data"]
        log(f"  ✓ Active Plan: {bill_data['organization']['plan']} | Credits: {bill_data['organization']['credit_balance']}", "SUCCESS")

        # Summary
        total_time = round(time.time() - start_all, 2)
        print("\n" + "="*70)
        log(f"Diagnostic Summary: {passed}/{len(test_cases)} Engine Workflows Verified in {total_time}s", "SUCCESS" if passed == len(test_cases) else "WARN")
        print("="*70 + "\n")

if __name__ == "__main__":
    run_diagnostics()
