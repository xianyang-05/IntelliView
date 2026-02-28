"""
Quick test to check: does the GEMINI_API_KEY support the Live API?
Tries several model names and reports which ones work.
"""
import os, asyncio, json
from dotenv import load_dotenv

load_dotenv()
_env_local = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env.local'))
load_dotenv(dotenv_path=_env_local, override=True)

API_KEY = os.getenv("GEMINI_API_KEY", "")
print(f"Using API key: {API_KEY[:10]}...{API_KEY[-4:]}")

MODELS_TO_TRY = [
    "models/gemini-2.0-flash-live-001",
    "models/gemini-2.0-flash",
    "models/gemini-2.0-flash-exp",
    "models/gemini-2.5-flash-preview-native-audio-dialog",
]

WS_BASE = (
    "wss://generativelanguage.googleapis.com/ws/"
    "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent"
    f"?key={API_KEY}"
)

async def test_model(model_name):
    import websockets
    try:
        ws = await websockets.connect(WS_BASE, additional_headers={"Content-Type": "application/json"}, max_size=None)
        setup = {
            "setup": {
                "model": model_name,
                "generation_config": {
                    "response_modalities": ["AUDIO"],
                    "speech_config": {
                        "voice_config": {
                            "prebuilt_voice_config": {
                                "voice_name": "Aoede"
                            }
                        }
                    }
                },
                "system_instruction": {
                    "parts": [{"text": "Say hello."}]
                }
            }
        }
        await ws.send(json.dumps(setup))
        response = await asyncio.wait_for(ws.recv(), timeout=10)
        data = json.loads(response)
        await ws.close()
        
        if "setupComplete" in data or "serverContent" in data:
            print(f"  [OK] {model_name} -- WORKS!")
            return True
        else:
            print(f"  [OK] {model_name} -- Response: {json.dumps(data)[:200]}")
            return True
    except Exception as e:
        err = str(e)
        if len(err) > 200:
            err = err[:200]
        print(f"  [FAIL] {model_name} -- {err}")
        return False

async def main():
    if not API_KEY:
        print("ERROR: No GEMINI_API_KEY found!")
        return
    
    print(f"\nTesting Live API (BidiGenerateContent) with {len(MODELS_TO_TRY)} models...\n")
    
    working = []
    for m in MODELS_TO_TRY:
        ok = await test_model(m)
        if ok:
            working.append(m)
    
    print(f"\n{'='*50}")
    if working:
        print(f"Working models: {working}")
        print(f"Use '{working[0]}' in interview_handler.py")
    else:
        print("NO models worked. Your API key does not have Live API access.")
        print("Options:")
        print("  1. Create a new API key at https://aistudio.google.com/apikey")
        print("  2. Switch to text-based interview (no Live API needed)")

if __name__ == "__main__":
    asyncio.run(main())
