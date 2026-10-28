"""Agentic tools for VoxAgent."""

import datetime
from zoneinfo import ZoneInfo
import httpx
import asyncio

def get_current_time(timezone: str = "Asia/Kolkata") -> dict:
    """Get current time, date, and day."""
    now = None
    try:
        tz = ZoneInfo(timezone)
        now = datetime.datetime.now(tz)
    except Exception:
        # Fallback for Windows environments without OS IANA tzdata
        if not timezone or "Kolkata" in timezone or timezone == "Asia/Kolkata":
            tz = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        elif "New_York" in timezone:
            tz = datetime.timezone(datetime.timedelta(hours=-4))
        elif "London" in timezone:
            tz = datetime.timezone(datetime.timedelta(hours=1))
        elif "Tokyo" in timezone:
            tz = datetime.timezone(datetime.timedelta(hours=9))
        else:
            tz = datetime.timezone.utc
        now = datetime.datetime.now(tz)

    return {
        "time": now.strftime("%I:%M %p"),
        "date": now.strftime("%d %B %Y"),
        "day": now.strftime("%A"),
        "timezone": timezone
    }

async def get_weather(city: str) -> dict:
    """Fetch real weather data using wttr.in."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://wttr.in/{city}?format=j1",
                headers={"User-Agent": "VoxAgent/1.0"}
            )
            
            if response.status_code != 200:
                return {"error": f"Weather data not found for {city}"}
            
            data = response.json()
            current = data["current_condition"][0]
            
            return {
                "city": city,
                "temperature_c": current["temp_C"],
                "feels_like_c": current["FeelsLikeC"],
                "description": current["weatherDesc"][0]["value"],
                "humidity": current["humidity"] + "%",
                "wind_kmph": current["windspeedKmph"] + " km/h",
            }
    except Exception as e:
        return {"error": f"Weather fetch failed: {str(e)}"}

# Pre-initialize DDGS client (reuse connection, skip session creation)
from ddgs import DDGS
_ddgs_client = DDGS()

async def search_web(query: str) -> dict:
    """Optimized web search using DuckDuckGo."""
    try:
        def _search():
            global _ddgs_client
            try:
                res = _ddgs_client.text(query, max_results=2, region="in-en")
                if res:
                    return res
                return _ddgs_client.text(query, max_results=2)
            except Exception:
                # Recreate client on connection failure or rate-limit
                _ddgs_client = DDGS()
                try:
                    return _ddgs_client.text(query, max_results=2)
                except Exception:
                    return []
        
        results = await asyncio.to_thread(_search)
        
        if not results:
            return {"query": query, "result": f"No recent web results found for '{query}'.", "source": "DuckDuckGo"}
        
        r = results[0]
        return {
            "query": query,
            "result": f"{r.get('title','')}: {r.get('body','')}"[:800],
            "source": "DuckDuckGo"
        }
    except Exception as e:
        return {"query": query, "result": f"Web search currently unavailable ({str(e)[:50]}).", "source": "DuckDuckGo"}

from app.rag.knowledge_base import kb

def search_knowledge(query: str) -> dict:
    """Search uploaded company documents using FAISS."""
    if not kb.is_ready:
        return {"error": "Knowledge base is empty. Upload documents from the UI first!"}
    
    results = kb.search(query, top_k=2)
    if not results:
        return {"query": query, "result": "No relevant information found in the documents."}
    
    context = "\n---\n".join([r["text"] for r in results])
    return {
        "query": query,
        "result": context,
        "sources": [r["source"] for r in results]
    }

from app.memory.database import memory

def book_appointment(date: str, time: str, purpose: str) -> dict:
    """Book a new appointment."""
    booking_id = memory.add_booking(date, time, purpose)
    return {
        "status": "success",
        "booking_id": booking_id,
        "message": f"Appointment booked for {date} at {time} for {purpose}."
    }

def get_bookings() -> dict:
    """Get all existing appointments."""
    bookings = memory.get_all_bookings()
    if not bookings:
        return {"message": "No appointments found."}
    return {"bookings": bookings}

def update_booking(booking_id: int, date: str, time: str, purpose: str) -> dict:
    """Reschedule or update an existing appointment."""
    success = memory.update_booking(booking_id, date, time, purpose)
    if success:
        return {"status": "success", "message": f"Booking #{booking_id} updated."}
    return {"status": "error", "message": f"Booking #{booking_id} not found."}

def delete_booking(booking_id: int) -> dict:
    """Cancel an appointment."""
    success = memory.delete_booking(booking_id)
    if success:
        return {"status": "success", "message": f"Booking #{booking_id} cancelled."}
    return {"status": "error", "message": f"Booking #{booking_id} not found."}

def get_customer_profile(phone: str = "", name: str = "") -> dict:
    """Look up customer details from CRM."""
    profile = memory.get_profile(phone=phone, name=name)
    if profile:
        return {"status": "found", "customer": profile}
    return {"status": "not_found", "message": "Customer profile not found."}

TOOL_REGISTRY = [
    {
        "name": "get_current_time",
        "description": "Get current time, date, and day of the week in a timezone (default Asia/Kolkata)",
        "parameters": {
            "type": "object",
            "properties": {
                "timezone": {"type": "string", "description": "Timezone name (e.g. Asia/Kolkata)"}
            }
        }
    },
    {
        "name": "get_weather",
        "description": "Get live weather for any city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"]
        }
    },
    {
        "name": "search_web",
        "description": "Search the web using DuckDuckGo for factual info, news, weather, or events",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "search_knowledge",
        "description": "Search company knowledge base / uploaded documents for internal information",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query about company/products"}
            },
            "required": ["query"]
        }
    },
    {
        "name": "book_appointment",
        "description": "Book a new appointment",
        "parameters": {
            "type": "object",
            "properties": {
                "date": {"type": "string", "description": "Date of appointment (e.g. 2026-03-15)"},
                "time": {"type": "string", "description": "Time of appointment (e.g. 02:00 PM)"},
                "purpose": {"type": "string", "description": "Purpose of the appointment"}
            },
            "required": ["date", "time", "purpose"]
        }
    },
    {
        "name": "get_bookings",
        "description": "Get all existing appointments",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "update_booking",
        "description": "Reschedule or update an appointment",
        "parameters": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "integer", "description": "ID of the booking to update"},
                "date": {"type": "string", "description": "New date"},
                "time": {"type": "string", "description": "New time"},
                "purpose": {"type": "string", "description": "New purpose"}
            },
            "required": ["booking_id", "date", "time", "purpose"]
        }
    },
    {
        "name": "delete_booking",
        "description": "Cancel an appointment",
        "parameters": {
            "type": "object",
            "properties": {
                "booking_id": {"type": "integer", "description": "ID of the booking to cancel"}
            },
            "required": ["booking_id"]
        }
    },
    {
        "name": "get_customer_profile",
        "description": "Look up customer details from CRM by phone or name",
        "parameters": {
            "type": "object",
            "properties": {
                "phone": {"type": "string", "description": "Customer phone number"},
                "name": {"type": "string", "description": "Customer name"}
            }
        }
    }
]

TOOL_FUNCTIONS = {
    "get_current_time": get_current_time,
    "get_weather": get_weather,
    "search_web": search_web,
    "search_knowledge": search_knowledge,
    "book_appointment": book_appointment,
    "get_bookings": get_bookings,
    "update_booking": update_booking,
    "delete_booking": delete_booking,
    "get_customer_profile": get_customer_profile,
}
