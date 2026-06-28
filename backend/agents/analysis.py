import requests
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def analyze_repository(repo):

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    full_name = repo["full_name"]

    # Get README content
    readme_score = 0
    try:
        readme_response = requests.get(
            f"https://api.github.com/repos/{full_name}/readme",
            headers=headers
        )
        if readme_response.status_code == 200:
            readme_score = 30  # has a README = good sign
    except:
        readme_score = 0

    # Get releases count
    release_score = 0
    try:
        releases_response = requests.get(
            f"https://api.github.com/repos/{full_name}/releases",
            headers=headers
        )
        releases = releases_response.json()
        if len(releases) > 10:
            release_score = 30
        elif len(releases) > 3:
            release_score = 20
        elif len(releases) > 0:
            release_score = 10
    except:
        release_score = 0

    # Score based on stars
    star_score = 0
    stars = repo["stars"]
    if stars > 10000:
        star_score = 40
    elif stars > 1000:
        star_score = 30
    elif stars > 100:
        star_score = 20
    else:
        star_score = 10

    # Total quality score out of 100
    quality_score = readme_score + release_score + star_score

    return {
        "quality_score": quality_score,
        "has_readme": readme_score > 0,
        "release_count": release_score,
        "star_score": star_score
    }