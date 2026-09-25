from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from ai.matcher import generate_final_json

app = FastAPI(title="ResumeX-AI Python Service")

class AnalyzeRequest(BaseModel):
    resumeText: str
    jobDescriptionText: str

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest) -> Dict[str, Any]:
    try:
        if not req.resumeText or not req.jobDescriptionText:
            raise HTTPException(status_code=400, detail="Missing resumeText or jobDescriptionText")
        
        result = generate_final_json(req.resumeText, req.jobDescriptionText)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
