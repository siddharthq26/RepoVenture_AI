# RepoVenture AI

> **An Agentic AI Platform for Open Source Partnership Intelligence**

RepoVenture AI helps technology companies discover, analyze, and evaluate open-source GitHub repositories for strategic business decisions — replacing weeks of manual research with minutes of AI-powered analysis.

---

## What It Does

A user types a business goal like **"Find AI agent frameworks for sponsorship"** and the platform automatically:

1. Searches GitHub for relevant repositories
2. Analyzes repository quality (README, releases, stars)
3. Evaluates community health (contributors, activity, issues)
4. Uses an LLM to generate business recommendations with confidence scores
5. Lets the user approve or reject each recommendation
6. Stores all previous searches in history

---

## Architecture

```
User types business goal in dashboard
              ↓
     React Frontend (Vite)
              ↓  HTTP POST /api/search
     FastAPI Backend (Python)
              ↓
     LangGraph Planner Agent
    ┌─────────┼──────────┐
    ↓         ↓          ↓
GitHub     Analysis   Community
Search     Agent      Agent
Agent         ↓          ↓
    └─────────┴──────────┘
              ↓
    Recommendation Agent
    (Gemini 2.5 Flash)
              ↓
    SQLite Database (history)
              ↓
    Results displayed in UI
```

### Agent Pipeline

| Agent | Responsibility | API Used |
|-------|---------------|----------|
| **Planner** | Orchestrates all agents via LangGraph | LangGraph StateGraph |
| **GitHub Search** | Finds repositories matching the business goal | GitHub REST API |
| **Analysis** | Scores repository quality (README, releases, stars) | GitHub REST API |
| **Community** | Scores community health (contributors, activity, issues) | GitHub REST API |
| **Recommendation** | Generates business recommendation with confidence % | Gemini 2.5 Flash |

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python 3.11+** | Core language |
| **FastAPI** | REST API framework |
| **LangGraph** | AI agent orchestration |
| **Gemini 2.5 Flash** | LLM for recommendations |
| **SQLite** | Database for search history |
| **SQLAlchemy** | ORM for database |
| **Pydantic** | Request/response validation |
| **GitHub REST API** | Repository data source |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React + TypeScript** | UI framework |
| **Vite** | Build tool |
| **CSS** | Dark theme styling |

---

## Project Structure

```
repoventure-ai/
├── backend/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── planner.py          # LangGraph pipeline orchestrator
│   │   ├── github_search.py    # GitHub API search agent
│   │   ├── analysis.py         # Repository quality scoring
│   │   ├── community.py        # Community health scoring
│   │   └── recommendation.py   # Gemini LLM recommendation agent
│   ├── main.py                 # FastAPI app and routes
│   ├── database.py             # SQLite models and queries
│   ├── .env                    # API keys (never commit this!)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.ts       # Backend API calls
    │   ├── components/
    │   │   ├── AgentStatusPanel.tsx
    │   │   ├── SearchSection.tsx
    │   │   ├── RepoCard.tsx
    │   │   ├── RecommendationPanel.tsx
    │   │   └── HistoryTab.tsx
    │   ├── types/
    │   │   └── api.ts          # TypeScript type definitions
    │   └── App.tsx             # Main app component
    ├── package.json
    └── vite.config.ts
```

---

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- A GitHub account (for API token)
- A Google account (free at aistudio.google.com)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-username/repoventure-ai.git
cd repoventure-ai
```

---

### Step 2 — Get your API keys

**GitHub Token:**
1. Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. Click "Generate new token"
3. Select `public_repo` and `read:user` permissions
4. Copy the token

**Gemini API Key:**
1. Go to aistudio.google.com
2. Sign up for free
3. Click "Get API Key" → "Create API Key in new project"
4. Copy the key (starts with `AIza...`)

---

### Step 3 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn langgraph langchain-google-genai google-genai requests sqlalchemy python-dotenv
```

Create a `.env` file inside the `backend` folder:

```env
GITHUB_TOKEN=your_github_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend will run at: `http://localhost:8000`

---

### Step 4 — Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

### Step 5 — Test it

1. Open `http://localhost:5173` in your browser
2. Type a business goal: `Find AI agent frameworks for sponsorship`
3. Select filters (optional): Language → Python, Minimum Stars → 100
4. Click **Discover**
5. Watch the agent pipeline run in real time
6. See repositories, scores, and AI recommendations appear
7. Click **Approve** or **Reject** on each recommendation

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/search` | Run agent pipeline with a business goal |
| `GET` | `/api/history` | Get list of previous searches |
| `GET` | `/api/history/{id}` | Get full results of a past search |
| `POST` | `/api/recommendations/{id}/approve` | Approve a recommendation |
| `POST` | `/api/recommendations/{id}/reject` | Reject a recommendation |
| `GET` | `/docs` | Interactive API documentation |

### Example Request

```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "objective": "Find AI agent frameworks for sponsorship",
    "language": "Python",
    "min_stars": 100
  }'
```

### Example Response

```json
{
  "results": [
    {
      "repo": {
        "name": "MetaGPT",
        "stars": 69064,
        "language": "Python",
        "license": "MIT License"
      },
      "analysis": {
        "quality_score": 100
      },
      "community": {
        "community_score": 100
      },
      "recommendation": {
        "action": "Sponsor",
        "confidence": 98,
        "reasons": [
          "High strategic value in multi-agent AI space",
          "Exceptional community with 69k stars",
          "MIT license allows commercial use"
        ]
      }
    }
  ]
}
```

---

## Key Features

- **Agentic AI Pipeline** — 5 specialized agents orchestrated by LangGraph
- **Real GitHub Data** — Live data from GitHub REST API, not mock data
- **AI Recommendations** — Gemini 2.5 Flash generates business-specific advice
- **Confidence Scores** — Every recommendation includes a confidence percentage
- **Explainable AI** — 3 specific reasons given for every recommendation
- **Human-in-the-Loop** — Approve or reject each recommendation
- **Search History** — All previous searches saved and accessible
- **Fallback System** — Score-based recommendations when LLM quota is exceeded
- **Dark Professional UI** — Clean dashboard with live agent status panel

---

## Scoring System

### Repository Quality Score (out of 100)
- Has README: +30 points
- Release count: up to +30 points
- Star count: up to +40 points

### Community Health Score (out of 100)
- Contributor count: up to +40 points
- Recent activity: up to +40 points
- Open issues activity: up to +20 points

### Recommendation Actions
| Action | Meaning |
|--------|---------|
| **Sponsor** | Fund the project for strategic partnership |
| **Adopt** | Integrate into your tech stack |
| **Recruit** | Hire key contributors |
| **Monitor** | Watch for future opportunities |
| **Avoid** | Not suitable for partnership |

---

## Future Enhancements

- Support for GitLab, npm, PyPI repositories
- Semantic search using vector embeddings
- Real-time agent status updates via WebSockets
- Team collaboration with role-based access
- Automated outreach email generation
- Slack and Jira integrations
- Analytics dashboard

---

## Use Cases

- **Developer Relations Teams** — Find projects to sponsor or contribute to
- **CTOs** — Evaluate open source tools before adoption
- **Partnership Managers** — Discover collaboration opportunities
- **Startup Founders** — Research the open source ecosystem
- **Open Source Program Offices (OSPO)** — Manage open source strategy

---

## Built With ❤️ at Hackathon

This project was built as a hackathon submission demonstrating:
- Multi-agent AI orchestration with LangGraph
- Real-world API integration (GitHub + Gemini)
- Full-stack development (FastAPI + React)
- Human-in-the-Loop AI decision making
- Explainable AI recommendations

---

## License

MIT License — feel free to use and build on this project.
