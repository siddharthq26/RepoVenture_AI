from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from agents.github_search import search_repositories
from agents.analysis import analyze_repository
from agents.community import analyze_community
from agents.recommendation import generate_recommendation

# This defines what data gets passed between agents
class AgentState(TypedDict):
    objective: str
    language: str
    min_stars: int
    repos: List[dict]
    analysis_results: List[dict]
    community_results: List[dict]
    final_results: List[dict]
    status: dict

# Agent 1 - Search GitHub
def github_search_node(state: AgentState):
    print("🔍 Planner: Running GitHub Search Agent...")
    repos = search_repositories(
        objective=state["objective"],
        language=state["language"],
        min_stars=state["min_stars"]
    )
    return {
        **state,
        "repos": repos,
        "status": {**state["status"], "github_search": "done"}
    }

# Agent 2 - Analyze each repo
def analysis_node(state: AgentState):
    print("📊 Planner: Running Analysis Agent...")
    analysis_results = []
    for repo in state["repos"][:5]:  # limit to 5
        analysis = analyze_repository(repo)
        analysis_results.append(analysis)
    return {
        **state,
        "analysis_results": analysis_results,
        "status": {**state["status"], "analysis": "done"}
    }

# Agent 3 - Check community health
def community_node(state: AgentState):
    print("👥 Planner: Running Community Agent...")
    community_results = []
    for repo in state["repos"][:5]:
        community = analyze_community(repo)
        community_results.append(community)
    return {
        **state,
        "community_results": community_results,
        "status": {**state["status"], "community": "done"}
    }

# Agent 4 - Generate recommendations
def recommendation_node(state: AgentState):
    print("🤖 Planner: Running Recommendation Agent (Gemini)...")
    final_results = []
    for i, repo in enumerate(state["repos"][:3]):
        analysis = state["analysis_results"][i]
        community = state["community_results"][i]
        recommendation = generate_recommendation(repo, analysis, community)
        final_results.append({
            "repo": repo,
            "analysis": analysis,
            "community": community,
            "recommendation": recommendation
        })
    return {
        **state,
        "final_results": final_results,
        "status": {**state["status"], "recommendation": "done"}
    }

# Build the LangGraph pipeline
def build_graph():
    graph = StateGraph(AgentState)

    # Add all agents as nodes
    graph.add_node("github_search", github_search_node)
    graph.add_node("analysis", analysis_node)
    graph.add_node("community", community_node)
    graph.add_node("recommendation", recommendation_node)

    # Connect them in order
    graph.set_entry_point("github_search")
    graph.add_edge("github_search", "analysis")
    graph.add_edge("analysis", "community")
    graph.add_edge("community", "recommendation")
    graph.add_edge("recommendation", END)

    return graph.compile()

# Run the full pipeline
def run_pipeline(objective, language="", min_stars=0):
    print("🚀 Planner: Starting pipeline...")
    
    graph = build_graph()
    
    initial_state = {
        "objective": objective,
        "language": language,
        "min_stars": min_stars,
        "repos": [],
        "analysis_results": [],
        "community_results": [],
        "final_results": [],
        "status": {
            "planner": "done",
            "github_search": "running",
            "analysis": "waiting",
            "community": "waiting",
            "recommendation": "waiting"
        }
    }

    result = graph.invoke(initial_state)
    print("✅ Planner: Pipeline complete!")
    
    return result["final_results"]