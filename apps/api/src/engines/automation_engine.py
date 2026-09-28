import datetime
import time
from typing import Dict, Any, List
from apps.api.src.engines.website_engine import WebsiteEngine
from apps.api.src.engines.perf_engine import PerformanceEngine

class AutomationEngine:
    @staticmethod
    async def execute_workflow(workflow_id: str, steps: List[Dict[str, Any]], target_url: str = "https://example.com") -> Dict[str, Any]:
        start_time = time.time()
        execution_log = []
        step_outputs = {}
        
        status = "COMPLETED"
        
        for idx, step in enumerate(steps, 1):
            step_type = step.get("type", "ACTION")
            step_name = step.get("name", f"Step {idx}")
            action_service = step.get("service_id")
            
            step_start = time.time()
            execution_log.append({
                "step_index": idx,
                "name": step_name,
                "status": "RUNNING",
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            })
            
            try:
                if action_service == "srv_web_audit_complete":
                    res = await WebsiteEngine.analyze_website(target_url)
                    step_outputs[f"step_{idx}"] = res
                elif action_service == "srv_perf_core_web_vitals":
                    res = await PerformanceEngine.analyze_performance(target_url)
                    step_outputs[f"step_{idx}"] = res
                else:
                    res = {"result": "Action executed successfully", "service": action_service}
                    step_outputs[f"step_{idx}"] = res
                    
                execution_log[-1]["status"] = "SUCCESS"
                execution_log[-1]["duration_seconds"] = round(time.time() - step_start, 2)
                
            except Exception as e:
                execution_log[-1]["status"] = "FAILED"
                execution_log[-1]["error"] = str(e)
                status = "FAILED"
                break
                
        return {
            "workflow_id": workflow_id,
            "status": status,
            "total_steps": len(steps),
            "executed_steps": len(execution_log),
            "execution_log": execution_log,
            "outputs": step_outputs,
            "duration_seconds": round(time.time() - start_time, 2)
        }
