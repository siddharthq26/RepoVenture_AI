from google import genai
import os
import time
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

def generate_recommendation(repo, analysis, community):

    prompt = f"""
    You are a business analyst helping organizations find open source projects 
    for strategic partnerships.

    Analyze this GitHub repository and give a business recommendation:

    Repository Name: {repo['name']}
    Description: {repo['description']}
    Stars: {repo['stars']}
    Forks: {repo['forks']}
    Language: {repo['language']}
    License: {repo['license']}
    Topics: {', '.join(repo['topics'])}
    Open Issues: {repo['open_issues']}

    Quality Score: {analysis['quality_score']} out of 100
    Has README: {analysis['has_readme']}

    Community Score: {community['community_score']} out of 100
    Recent Activity Score: {community['activity_score']} out of 40

    Based on this data, provide:
    1. Recommended Action (choose ONE: Sponsor / Adopt / Recruit / Monitor / Avoid)
    2. Confidence Percentage (0-100%)
    3. Three specific reasons for your recommendation

    Reply in this exact format:
    ACTION: [your action]
    CONFIDENCE: [number]%
    REASONS:
    - [reason 1]
    - [reason 2]
    - [reason 3]
    """

    try:
        # Wait 2 seconds between calls to avoid hitting rate limits
        time.sleep(2)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        text = response.text

        # Parse Gemini's response
        lines = text.strip().split("\n")
        action = "Monitor"
        confidence = 50
        reasons = []

        for line in lines:
            if line.startswith("ACTION:"):
                action = line.replace("ACTION:", "").strip()
            elif line.startswith("CONFIDENCE:"):
                try:
                    confidence = int(
                        line.replace("CONFIDENCE:", "")
                        .replace("%", "")
                        .strip()
                    )
                except:
                    confidence = 50
            elif line.startswith("- "):
                reasons.append(line.replace("- ", "").strip())

        return {
            "action": action,
            "confidence": confidence,
            "reasons": reasons
        }

    except Exception as e:
        print(f"⚠️ Gemini error: {e}")
        # Fallback recommendation based on scores
        quality = analysis['quality_score']
        community_score = community['community_score']
        total = quality + community_score

        if total > 150:
            action = "Sponsor"
            confidence = 85
        elif total > 100:
            action = "Adopt"
            confidence = 70
        elif total > 60:
            action = "Monitor"
            confidence = 60
        else:
            action = "Avoid"
            confidence = 55

        return {
            "action": action,
            "confidence": confidence,
            "reasons": [
                f"Quality score: {quality}/100",
                f"Community score: {community_score}/100",
                "Recommendation based on scores (Gemini quota exceeded)"
            ]
        }
