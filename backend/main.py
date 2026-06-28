import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.planner import run_pipeline
from database import init_db, save_recommendation, SessionLocal, SearchHistory

app = FastAPI()

# This allows your frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def startup():
    init_db()

# Input model - what the frontend sends
class SearchRequest(BaseModel):
    objective: str
    language: str = ""
    min_stars: int = 0
    license: str = ""

# Main search route - frontend calls this
@app.post("/api/search")
def search(request: SearchRequest):
    print(f"🎯 Received search: {request.objective}")
    
    # Run all agents through LangGraph
    results = run_pipeline(
        objective=request.objective,
        language=request.language,
        min_stars=request.min_stars
    )

    # Save to database
    save_recommendation(request.objective, results)

    return {"results": results}

# History list route
@app.get("/api/history")
def history():
    db = SessionLocal()
    records = db.query(SearchHistory).order_by(
        SearchHistory.created_at.desc()
    ).limit(10).all()
    db.close()
    
    searches = []
    for r in records:
        try:
            results_data = json.loads(r.results) if r.results else []
        except Exception:
            results_data = []
            
        searches.append({
            "id": str(r.id),
            "goal": r.objective,
            "filters": {},
            "created_at": str(r.created_at),
            "status": "completed",
            "repository_count": len(results_data),
            "recommendation_count": len(results_data),
        })
    return {"searches": searches}

# History detail route
@app.get("/api/history/{search_id}")
def history_search(search_id: int):
    db = SessionLocal()
    record = db.query(SearchHistory).filter(SearchHistory.id == search_id).first()
    db.close()
    if not record:
        raise HTTPException(status_code=404, detail="Search history not found")
        
    try:
        results = json.loads(record.results) if record.results else []
    except Exception:
        results = []
        
    repositories = []
    recommendations = []
    for idx, item in enumerate(results):
        repo = item.get("repo", {})
        rec = item.get("recommendation", {})
        repositories.append({
            "id": repo.get("full_name") or repo.get("name") or str(idx),
            "name": repo.get("name", ""),
            "full_name": repo.get("full_name", ""),
            "stars": repo.get("stars", 0),
            "forks": repo.get("forks", 0),
            "language": repo.get("language"),
            "license": repo.get("license"),
            "description": repo.get("description"),
            "url": repo.get("url", "")
        })
        recommendations.append({
            "id": f"{search_id}_{idx}",
            "repo_name": repo.get("name", ""),
            "recommended_action": rec.get("action", "Monitor"),
            "confidence": rec.get("confidence", 50),
            "reasoning": "\n".join(rec.get("reasons", [])),
            "status": "pending"
        })
        
    return {
        "search_id": str(record.id),
        "goal": record.objective,
        "filters": {},
        "repositories": repositories,
        "recommendations": recommendations
    }

# Approve or reject a recommendation
@app.post("/api/recommendations/{recommendation_id}/approve")
def approve_recommendation(recommendation_id: str):
    print(f"Approved recommendation: {recommendation_id}")
    return {"id": recommendation_id, "status": "approved"}

@app.post("/api/recommendations/{recommendation_id}/reject")
def reject_recommendation(recommendation_id: str):
    print(f"Rejected recommendation: {recommendation_id}")
    return {"id": recommendation_id, "status": "rejected"}

# Legacy approve/reject route
class DecisionRequest(BaseModel):
    decision: str  # "approve" or "reject"

@app.post("/api/recommendations/{repo_name}/decision")
def save_decision(repo_name: str, request: DecisionRequest):
    print(f"Decision for {repo_name}: {request.decision}")
    return {
        "status": "saved",
        "repo": repo_name,
        "decision": request.decision
    }

# Health check
@app.get("/")
def root():
    return {"status": "OpenSource Connect AI backend is running!"}