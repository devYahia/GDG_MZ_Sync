import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from backend.llm_service import generate_interview_chat
    from backend.schemas import InterviewChatRequest, ChatMessage
    
    print("✅ Successfully imported llm_service")
    
    print("✅ Successfully imported llm_service")
    
    # Try multiple models
    models_to_try = [
        "gemini-1.5-flash", 
        "models/gemini-1.5-flash", 
        "gemini-pro", 
        "models/gemini-pro",
        "gemini-1.0-pro"
    ]

    for model_name in models_to_try:
        print(f"\n--- Testing model: {model_name} ---")
        try:
            # We need to manually construct the LLM with the specific model to test it
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=os.getenv("GEMINI_API_KEY"),
                temperature=0.7
            )
            res = llm.invoke("Hello, are you working?")
            print(f"✅ SUCCESS with {model_name}! Response: {res.content}")
            break 
        except Exception as e:
            print(f"❌ FAILED with {model_name}: {e}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
