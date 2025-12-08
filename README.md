# Airline Travel Assistant

A web-based flight search application that allows users to search for one-way and round-trip flights using Google Flights API via SerpAPI. Features include real-time flight data, airport code autocomplete, detailed flight information with CO₂ emissions, and a two-step booking flow for round trips.

## Features

- 🔍 **Smart Flight Search** - Search for one-way and round-trip flights
- ✈️ **Airport Autocomplete** - Search airports by code, city, or name
- 🎫 **Two-Step Booking** - Select outbound and return flights separately for round trips
- 📊 **Detailed Flight Info** - View prices, airlines, layovers, duration, and amenities
- 🌱 **CO₂ Emissions** - See carbon footprint for each flight option
- 🎨 **Modern UI** - Beautiful dark-themed interface with Tailwind CSS

## Prerequisites

- Python 3.9 or higher
- SerpAPI account and API key ([Get one here](https://serpapi.com/))
- Chrome browser (for Selenium tests)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ZunayedAhmed7/Airline-Travel-Assistant.git
cd Airline-Travel-Assistant
```

### 2. Create Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Windows
echo GOOGLE_API_KEY=your_serpapi_key_here > .env

# macOS/Linux
echo "GOOGLE_API_KEY=your_serpapi_key_here" > .env
```

Or manually create a `.env` file with:
```
GOOGLE_API_KEY=your_serpapi_key_here
```

Replace `your_serpapi_key_here` with your actual SerpAPI key.

### 5. Run the Application

```bash
python run.py
```

The application will start at `http://127.0.0.1:5000`

Open your browser and navigate to the URL to start searching for flights!

## Project Structure

```
Airline-Travel-Assistant/
├── backend/
│   ├── app.py              # Flask application and routes
│   └── flight_api.py       # SerpAPI integration
├── frontend/
│   ├── Templates/
│   │   └── index.html      # Main HTML template
│   ├── static/
│   │   └── script.js       # Frontend JavaScript
│   └── images/             # Static images
├── airportCodes.json       # Airport data for autocomplete
├── requirements.txt        # Python dependencies
├── run.py                 # Application entry point
├── test_flights.py        # Selenium tests
└── .env                   # Environment variables (create this)
```

## Testing

### Run Selenium Tests

Make sure the Flask server is running first, then in a new terminal:

```bash
python test_flights.py
```

The tests will:
1. Test one-way flight search functionality
2. Test round-trip booking with two-step itinerary selection

### Manual Testing

1. **One-Way Trip:**
   - Select "One way" from dropdown
   - Enter departure airport (e.g., JFK)
   - Enter arrival airport (e.g., LAX)
   - Select departure date
   - Click "Search Flights"
   - Select a flight from results

2. **Round-Trip:**
   - Select "Round trip" from dropdown
   - Enter airports and both dates
   - Click "Search Flights"
   - Select an outbound flight (added to itinerary)
   - Click "Search Return Flights"
   - Select a return flight (both shown in itinerary)

## Usage Tips

- Use airport codes (JFK, LAX) or start typing city names for autocomplete suggestions
- Top 3 flights are highlighted as "Top Flight" options
- View CO₂ emissions and compare against average for each route
- See amenities like Wi-Fi, power outlets, and legroom details
- For round trips, you can mix and match different airlines for outbound/return

## Technologies Used

- **Backend:** Flask (Python)
- **Frontend:** HTML, JavaScript, Tailwind CSS
- **API:** SerpAPI (Google Flights)
- **Testing:** Selenium WebDriver
- **Icons:** Font Awesome

## Troubleshooting

**Issue:** `ModuleNotFoundError: No module named 'serpapi'`  
**Solution:** Make sure you've activated the virtual environment and installed requirements.

**Issue:** `GOOGLE_API_KEY not found`  
**Solution:** Check that your `.env` file exists and contains the correct API key.

**Issue:** No flights found  
**Solution:** Verify your API key is valid and has credits. Check airport codes are correct.

**Issue:** Selenium tests fail  
**Solution:** Ensure Chrome browser is installed and the Flask server is running at `http://127.0.0.1:5000`
