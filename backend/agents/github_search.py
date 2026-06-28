import requests
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def search_repositories(objective, language="", min_stars=0):

    # Extract keywords from the objective
    # Remove common words and keep important ones
    keywords = objective.lower()
    keywords = keywords.replace("find", "")
    keywords = keywords.replace("for", "")
    keywords = keywords.replace("sponsorship", "")
    keywords = keywords.replace("discover", "")
    keywords = keywords.strip()

    # Build a simpler search query
    query = keywords
    if language:
        query += f" language:{language}"
    if min_stars > 0:
        query += f" stars:>={min_stars}"

    print(f"🔍 Searching GitHub with query: {query}")

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    params = {
        "q": query,
        "sort": "stars",
        "order": "desc",
        "per_page": 10
    }

    response = requests.get(
        "https://api.github.com/search/repositories",
        headers=headers,
        params=params
    )

    print(f"📡 GitHub API status: {response.status_code}")
    data = response.json()
    print(f"📦 Total results found: {data.get('total_count', 0)}")

    # If no results, try with just first 2 keywords
    if not data.get("items"):
        simple_query = " ".join(keywords.split()[:2])
        print(f"🔄 Retrying with simpler query: {simple_query}")
        params["q"] = simple_query
        response = requests.get(
            "https://api.github.com/search/repositories",
            headers=headers,
            params=params
        )
        data = response.json()

    repos = []
    for item in data.get("items", []):
        repos.append({
            "name": item["name"],
            "full_name": item["full_name"],
            "description": item.get("description", "No description"),
            "stars": item["stargazers_count"],
            "forks": item["forks_count"],
            "language": item.get("language", "Unknown"),
            "license": item["license"]["name"] if item.get("license") else "No license",
            "url": item["html_url"],
            "owner": item["owner"]["login"],
            "topics": item.get("topics", []),
            "open_issues": item["open_issues_count"],
            "last_updated": item["updated_at"]
        })

    print(f"✅ Returning {len(repos)} repos")
    return repos