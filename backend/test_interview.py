import requests
import json
import base64
import os

BASE_URL = "http://127.0.0.1:8001"

def test_interview_chat():
    print("\n--- Testing /api/interview/chat ---")
    url = f"{BASE_URL}/api/interview/chat"
    
    payload = {
        "messages": [],
        "job_description": "Senior Frontend Engineer at Google. Requires React, Next.js, and strong system design skills.",
        "language": "en"
    }
    
    try:
        # 1. Initial greeting (empty messages)
        print("Sending initial request (empty history)...")
        res = requests.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        print(f"✅ AI Reply: {data.get('reply')}\n")
        
        # 2. User response
        user_msg = "I have 5 years of experience with React and love building scalable UIs."
        payload["messages"].append({"role": "assistant", "content": data.get("reply")})
        payload["messages"].append({"role": "user", "content": user_msg})
        
        print(f"Sending user response: '{user_msg}'...")
        res = requests.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        print(f"✅ AI Reply: {data.get('reply')}\n")
        
        return payload["messages"] + [{"role": "assistant", "content": data.get("reply")}]

    except Exception as e:
        print(f"❌ Chat Test Failed: {e}")
        if hasattr(e, 'response') and e.response:
             print(f"Server Response: {e.response.text}")
        # Return what we have so far to test feedback anyway
        if payload["messages"]:
             return payload["messages"]
        return []

def test_interview_feedback(history):
    print("\n--- Testing /api/interview/feedback ---")
    if not history:
        print("⚠️ Skipping feedback test due to empty history.")
        return

    url = f"{BASE_URL}/api/interview/feedback"
    payload = {
        "messages": history,
        "job_description": "Senior Frontend Engineer at Google",
        "language": "en"
    }
    
    try:
        print("Requesting feedback report...")
        res = requests.post(url, json=payload)
        res.raise_for_status()
        data = res.json()
        report = data.get("report", "")
        print(f"✅ Feedback Received ({len(report)} chars):\n{report[:200]}...\n")
    except Exception as e:
        print(f"❌ Feedback Test Failed: {e}")
        if hasattr(e, 'response') and e.response:
             print(f"Server Response: {e.response.text}")

if __name__ == "__main__":
    history = test_interview_chat()
    test_interview_feedback(history)
