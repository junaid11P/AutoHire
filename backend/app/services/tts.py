import io
import requests
import base64

TIKTOK_VOICES = {
    "female": "en_us_001",
    "male": "en_us_006"
}

def generate_lip_sync_json(audio_stream: io.BytesIO) -> dict:
    """
    MOCK FUNCTION: Simulates running the Rhubarb Lip Sync tool on the audio stream.
    
    In a real implementation, this function would:
    1. Save the BytesIO stream to a temporary .wav or .ogg file.
    2. Call the external `rhubarb` command-line tool with the file and dialog text.
    3. Read the resulting JSON file containing timestamps and visemes (mouth shapes).
    4. Return the JSON data.
    """
    # Placeholder JSON structure mimicking Rhubarb's output
    mock_data = {
        "metadata": {"version": 1},
        "mouthCues": [
            {"start": 0.00, "end": 0.15, "value": "A"},
            {"start": 0.15, "end": 0.35, "value": "C"},
            {"start": 0.35, "end": 0.50, "value": "B"},
            {"start": 0.50, "end": 0.60, "value": "X"}
        ]
    }
    print("MOCK: Rhubarb Lip Sync data generated.")
    return mock_data

def generate_tiktok_tts(text: str, voice: str = "en_us_001") -> str:
    """
    Attempts to generate TikTok TTS audio and returns base64 string.
    """
    url = "https://tiktok-tts.weilnet.workers.dev/api/generation"
    payload = {
        "text": text[:250],  # Max length protection
        "voice": voice
    }
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "data" in data and data["data"]:
                return data["data"]
    except Exception as e:
        print(f"TikTok TTS Worker Error: {e}")
        
    return ""  # Empty string fallback
