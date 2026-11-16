"""Provider-agnostic chat LLM. The only module that calls a chat API."""

from functools import lru_cache

from app.config import settings

# history items: {"role": "user" | "assistant", "content": str}
History = list[dict[str, str]]


@lru_cache
def _gemini():
    from google import genai

    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set (backend/.env)")
    return genai.Client(api_key=settings.gemini_api_key)


@lru_cache
def _groq():
    from groq import Groq

    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set (backend/.env)")
    return Groq(api_key=settings.groq_api_key)


def _generate_gemini(system: str, history: History, user: str) -> str:
    from google.genai import types

    contents = [
        types.Content(
            role="model" if m["role"] == "assistant" else "user",
            parts=[types.Part.from_text(text=m["content"])],
        )
        for m in history
    ]
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user)]))
    res = _gemini().models.generate_content(
        model=settings.gemini_chat_model,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=system, temperature=0.3),
    )
    return (res.text or "").strip()


def _generate_groq(system: str, history: History, user: str) -> str:
    messages = [{"role": "system", "content": system}, *history, {"role": "user", "content": user}]
    res = _groq().chat.completions.create(
        model=settings.groq_chat_model, messages=messages, temperature=0.3
    )
    return (res.choices[0].message.content or "").strip()


def generate(system: str, history: History, user: str) -> str:
    if settings.llm_provider == "groq":
        return _generate_groq(system, history, user)
    return _generate_gemini(system, history, user)
