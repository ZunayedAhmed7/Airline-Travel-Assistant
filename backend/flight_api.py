from serpapi import GoogleSearch
from dotenv import load_dotenv
import os

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


def search_flights(departure_id, arrival_id, outbound_date, return_date=None, adults=1, travel_class=1, flight_type=2):
    """
    Search for flights using SerpAPI Google Flights API
    
    Args:
        departure_id: Departure airport code (e.g., "JFK")
        arrival_id: Arrival airport code (e.g., "LAX")
        outbound_date: Departure date in YYYY-MM-DD format
        return_date: Return date in YYYY-MM-DD format (optional, for round trips)
        adults: Number of adult passengers (default: 1)
        travel_class: Travel class (1=Economy, 2=Premium Economy, 3=Business, 4=First, default: 1)
        flight_type: Trip type (1=Round-trip, 2=One-way, default: 1)
    
    Returns:
        List of flight options with details
    """
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not found in environment variables")
    
    params = {
        "engine": "google_flights",
        "departure_id": departure_id,
        "arrival_id": arrival_id,
        "outbound_date": outbound_date,
        "adults": str(adults),
        "travel_class": str(travel_class),
        "type": str(flight_type),
        "currency": "USD",
        "hl": "en",
        "api_key": GOOGLE_API_KEY
    }
    
    # Add return_date only if provided and it's a round trip
    if return_date and flight_type == 1:
        params["return_date"] = return_date
    
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Debug: Print the full results to see what we're getting
        print("=" * 50)
        print("API Response:")
        print(f"Keys in results: {results.keys()}")
        print(f"Search metadata: {results.get('search_metadata', {})}")
        print(f"Best flights count: {len(results.get('best_flights', []))}")
        print(f"Other flights count: {len(results.get('other_flights', []))}")
        
        # Check for errors in the response
        if 'error' in results:
            print(f"API Error: {results['error']}")
            raise Exception(f"API Error: {results['error']}")
        
        # Extract flight information
        flights = []
        
        # Check if we have best_flights or other_flights
        best_flights = results.get("best_flights", [])
        other_flights = results.get("other_flights", [])
        
        all_flights = best_flights + other_flights
        
        print(f"Total flights to process: {len(all_flights)}")
        
        for idx, flight_data in enumerate(all_flights):
            print(f"\n--- Processing flight {idx + 1} ---")
            print(f"Flight data keys: {flight_data.keys()}")
            print(f"Number of flight legs: {len(flight_data.get('flights', []))}")
            
            # Extract all flight legs (for round trips, there will be multiple legs)
            if "flights" in flight_data and len(flight_data["flights"]) > 0:
                first_leg = flight_data["flights"][0]
                
                # For round trips, extract both outbound and return flights
                all_legs = []
                for leg in flight_data["flights"]:
                    all_legs.append({
                        "departure_airport": leg.get("departure_airport"),
                        "arrival_airport": leg.get("arrival_airport"),
                        "duration": leg.get("duration"),
                        "airline": leg.get("airline"),
                        "airline_logo": leg.get("airline_logo"),
                        "flight_number": leg.get("flight_number"),
                        "airplane": leg.get("airplane"),
                        "travel_class": leg.get("travel_class"),
                        "extensions": leg.get("extensions", []),
                        "overnight": leg.get("overnight", False)
                    })
                
                flight_info = {
                    "price": flight_data.get("price"),
                    "type": flight_data.get("type"),
                    "airline": first_leg.get("airline"),
                    "airline_logo": flight_data.get("airline_logo") or first_leg.get("airline_logo"),
                    "flight_number": first_leg.get("flight_number"),
                    "airplane": first_leg.get("airplane"),
                    "travel_class": first_leg.get("travel_class"),
                    "departure_airport": first_leg.get("departure_airport"),
                    "arrival_airport": first_leg.get("arrival_airport"),
                    "duration": first_leg.get("duration"),
                    "total_duration": flight_data.get("total_duration"),
                    "stops": len(flight_data["flights"]) - 1,
                    "layovers": flight_data.get("layovers", []),
                    "carbon_emissions": flight_data.get("carbon_emissions"),
                    "booking_token": flight_data.get("booking_token"),
                    "extensions": first_leg.get("extensions", []),
                    "all_flights": all_legs  # Include all legs for round trips
                }
                
                flights.append(flight_info)
                print(f"Added flight: {flight_info['airline']} - ${flight_info['price']}")
        
        print(f"Returning {len(flights)} flights")
        print("=" * 50)
        
        return flights
    
    except Exception as e:
        print(f"Exception in search_flights: {str(e)}")
        raise Exception(f"Error searching flights: {str(e)}")


GoogleSearch.SERP_API_KEY = GOOGLE_API_KEY