import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
        print("Google GenAI Client initialized successfully.")
    except Exception as e:
        print(f"Error initializing GenAI Client: {e}")
