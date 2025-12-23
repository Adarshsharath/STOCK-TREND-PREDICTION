import os
from typing import List, Dict

import requests


SYSTEM_PROMPT = (
    "You are FinSight AI, a helpful assistant for stock analysis, "
    "trading strategies, and market insights. Be concise, cite sources "
    "if the model provides them, and avoid personal financial advice."
)


def _build_messages(user_message: str, conversation_history: List[Dict]) -> List[Dict]:
    messages: List[Dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in conversation_history or []:
        role = m.get("role")
        content = m.get("content")
        if role in ("user", "assistant") and isinstance(content, str):
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": str(user_message)})
    return messages


def _fallback_response(user_message: str) -> str:
    return (
        "I’m here to help with market insights and trading concepts. "
        "Right now I don’t have access to the AI provider, so here’s a general tip: "
        "focus on understanding indicators (RSI, MACD, EMA), risk management, and "
        "maintain a clear thesis for each trade. Ask me specific questions (e.g., "
        "'Explain RSI for swing trading' or 'Compare EMA and SMA')."
    )


def generate_response(user_message: str, conversation_history: List[Dict]) -> Dict:
    """Generate a chatbot response using Perplexity with graceful fallback.

    Returns a dict: {"response": str, "conversation_history": List[Dict]}
    """
    api_key = os.getenv("PERPLEXITY_API_KEY")
    messages = _build_messages(user_message, conversation_history)

    if not api_key:
        return {"response": _fallback_response(user_message), "conversation_history": messages[1:]}

    try:
        # Perplexity's OpenAI-compatible Chat Completions endpoint
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": os.getenv("PERPLEXITY_MODEL", "sonar-small-online"),
            "messages": messages,
            "temperature": 0.7,
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        # OpenAI-like structure: choices[0].message.content
        content = (
            (data.get("choices") or [{}])[0].get("message", {}).get("content")
            or _fallback_response(user_message)
        )
        return {"response": content, "conversation_history": messages[1:]}
    except Exception:
        # Graceful fallback on any error
        return {"response": _fallback_response(user_message), "conversation_history": messages[1:]}