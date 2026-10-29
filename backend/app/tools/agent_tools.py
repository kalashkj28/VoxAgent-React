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

bookings = {}
booking_counter = 0

def book_appointment(date: str, time: str, purpose: str = "General") -> dict:
    """Book an appointment."""
    global booking_counter
    booking_counter += 1
    booking_id = f"BK-{booking_counter:03d}"
    
    bookings[booking_id] = {
        "date": date,
        "time": time,
        "purpose": purpose,
        "status": "confirmed"
    }
    
    return {
        "status": "confirmed",
        "booking_id": booking_id,
        "date": date,
        "time": time,
        "purpose": purpose,
        "message": f"Appointment booked! ID: {booking_id}"
    }

def get_bookings() -> dict:
    """Show all bookings."""
    if not bookings:
        return {"message": "No bookings currently.", "bookings": []}
    
    return {
        "total": len(bookings),
        "bookings": [
            {"id": bid, **details} for bid, details in bookings.items()
        ]
    }

def update_booking(booking_id: str, date: str = "", time: str = "", purpose: str = "") -> dict:
    """Reschedule or update a booking."""
    bid = str(booking_id).upper().strip()
    if not bid.startswith("BK-") and bid.isdigit():
        bid = f"BK-{int(bid):03d}"
    
    if bid not in bookings:
        return {"error": f"Booking '{bid}' not found. Check 'get_bookings' first."}
    
    if date:
        bookings[bid]["date"] = date
    if time:
        bookings[bid]["time"] = time
    if purpose:
        bookings[bid]["purpose"] = purpose
    
    return {
        "status": "updated",
        "booking_id": bid,
        **bookings[bid],
        "message": f"Booking {bid} updated successfully!"
    }

def cancel_booking(booking_id: str) -> dict:
    """Cancel a booking."""
    bid = str(booking_id).upper().strip()
    if not bid.startswith("BK-") and bid.isdigit():
        bid = f"BK-{int(bid):03d}"
    
    if bid not in bookings:
        return {"error": f"Booking '{bid}' not found."}
    
    cancelled = bookings.pop(bid)
    return {
        "status": "cancelled",
        "booking_id": bid,
        **cancelled,
        "message": f"Booking {bid} cancelled!"
    }

# Alias delete_booking to cancel_booking
delete_booking = cancel_booking

CRM_DATABASE = {
    "C001": {
        "name": "Rahul Sharma", "phone": "9876543210", "email": "rahul@example.com",
        "plan": "Premium", "status": "Active", "since": "Jan 2023",
        "last_payment": "Aug 2026", "pending_amount": "Rs 0"
    },
    "C002": {
        "name": "Priya Singh", "phone": "9876543211", "email": "priya@example.com",
        "plan": "Basic", "status": "Active", "since": "Mar 2024",
        "last_payment": "Jul 2026", "pending_amount": "Rs 499"
    },
    "C003": {
        "name": "Amit Kumar", "phone": "9876543212", "email": "amit@example.com",
        "plan": "Enterprise", "status": "Active", "since": "Jun 2022",
        "last_payment": "Aug 2026", "pending_amount": "Rs 0"
    },
    "C004": {
        "name": "Neha Gupta", "phone": "9876543213", "email": "neha@example.com",
        "plan": "Premium", "status": "Inactive", "since": "Dec 2023",
        "last_payment": "May 2026", "pending_amount": "Rs 1999"
    },
    "C005": {
        "name": "Vikram Patel", "phone": "9876543214", "email": "vikram@example.com",
        "plan": "Basic", "status": "Active", "since": "Sep 2024",
        "last_payment": "Aug 2026", "pending_amount": "Rs 0"
    },
}

def lookup_customer(query: str = "", phone: str = "", name: str = "") -> dict:
    """Search CRM for customer by ID, name, or phone."""
    search_term = (query or phone or name or "").lower().strip()
    
    if search_term.upper() in CRM_DATABASE:
        customer = CRM_DATABASE[search_term.upper()]
        return {"found": True, "customer_id": search_term.upper(), **customer}
    
    for cid, data in CRM_DATABASE.items():
        if (search_term in data["name"].lower() or 
            search_term in data["phone"] or
            search_term in data.get("email", "").lower()):
            return {"found": True, "customer_id": cid, **data}
    
    return {"found": False, "message": f"No customer found for '{search_term}'."}

# Alias get_customer_profile to lookup_customer
get_customer_profile = lookup_customer

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
    "cancel_booking": cancel_booking,
    "get_customer_profile": get_customer_profile,
    "lookup_customer": lookup_customer,
}
