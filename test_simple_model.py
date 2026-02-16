import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv("backend/.env")

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")

try:
    llm = ChatGoogleGenerativeAI(
        model="gemini-pro",
        google_api_key=api_key,
        temperature=0.7
    )
    res = llm.invoke("Hi")
    print(f"✅ SUCCESS with gemini-pro! Response: {res.content}")
except Exception as e:
    print(f"❌ FAILED with gemini-pro: {e}")
