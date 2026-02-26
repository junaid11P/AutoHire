import io
import requests
import base64
TIKTOK_VOICES = {
    "female": "en_us_001",
    "male": "en_us_006"
}

def generate_tiktok_tts(text: str, voice: str = "en_us_001") -> str:
    """
    Generates TikTok TTS audio.
    Returns base64-encoded audio string.
    """
    url = "https://tiktok-tts.weilnet.workers.dev/api/generation"

    payload = {
        "text": text[:250],        # TikTok text length limit
        "voice": voice
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()

        data = response.json()
        if "data" in data and data["data"]:
            return data["data"]

    except Exception as e:
        print(f"TikTok TTS Error: {e}")

    return ""  # Graceful fallback

def generate_lip_sync_json(audio_stream: io.BytesIO) -> dict:
    """
    MOCK FUNCTION: Simulates Rhubarb Lip Sync output.
    """
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