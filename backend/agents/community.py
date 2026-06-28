import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def analyze_community(repo):

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    full_name = repo["full_name"]

    # Get contributors count
    contributor_score = 0
    try:
        contributors_response = requests.get(
            f"https://api.github.com/repos/{full_name}/contributors",
            headers=headers,
            params={"per_page": 100}
        )
        contributors = contributors_response.json()
        count = len(contributors)
        if count > 50:
            contributor_score = 40
        elif count > 20:
            contributor_score = 30
        elif count > 5:
            contributor_score = 20
        else:
            contributor_score = 10
    except:
        contributor_score = 0

    # Check how recently the repo was updated
    activity_score = 0
    try:
        last_updated = repo["last_updated"]
        updated_date = datetime.fromisoformat(
            last_updated.replace("Z", "+00:00")
        )
        now = datetime.now(timezone.utc)
        days_since_update = (now - updated_date).days

        if days_since_update < 7:
            activity_score = 40
        elif days_since_update < 30:
            activity_score = 30
        elif days_since_update < 90:
            activity_score = 20
        else:
            activity_score = 10
    except:
        activity_score = 0

    # Score based on open issues
    issue_score = 0
    open_issues = repo.get("open_issues", 0)
    if open_issues > 100:
        issue_score = 20  # very active community
    elif open_issues > 20:
        issue_score = 15
    elif open_issues > 5:
        issue_score = 10
    else:
        issue_score = 5

    # Total community health score out of 100
    community_score = contributor_score + activity_score + issue_score

    return {
        "community_score": community_score,
        "contributor_score": contributor_score,
        "activity_score": activity_score,
        "issue_score": issue_score
    }