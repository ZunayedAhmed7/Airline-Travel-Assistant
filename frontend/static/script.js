let index = 0;
const slides = document.querySelectorAll('.hero-slide');

setInterval(() => {
    slides[index].style.opacity = 0;
    index = (index + 1) % slides.length;
    slides[index].style.opacity = 1;
}, 5000);

// Airport autocomplete
let airportData = [];

// Fetch airport data
fetch('/api/airports')
    .then(r => r.json())
    .then(data => {
        airportData = data;
    })
    .catch(e => console.error('Failed to load airports:', e));

// Autocomplete setup
function setupAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    input.addEventListener('input', function() {
        const value = this.value.toUpperCase().trim();
        
        if (value.length < 1) {
            dropdown.classList.add('hidden');
            return;
        }
        
        // Filter airports
        const matches = airportData.filter(airport => {
            return airport.code.startsWith(value) || 
                   airport.city.toUpperCase().includes(value) ||
                   airport.name.toUpperCase().includes(value);
        }).slice(0, 8); // Limit to 8 results
        
        if (matches.length > 0) {
            dropdown.innerHTML = matches.map(airport => `
                <div class="px-4 py-3 hover:bg-blue-600/30 cursor-pointer border-b border-white/5 last:border-0" 
                     onclick="selectAirport('${inputId}', '${airport.code}', '${dropdownId}')">
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="font-bold text-blue-300">${airport.code}</span>
                            <span class="text-sm text-gray-300 ml-2">${airport.city}</span>
                        </div>
                        <span class="text-xs text-gray-500">${airport.country}</span>
                    </div>
                    <div class="text-xs text-gray-400 mt-1">${airport.name}</div>
                </div>
            `).join('');
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

function selectAirport(inputId, code, dropdownId) {
    document.getElementById(inputId).value = code;
    document.getElementById(dropdownId).classList.add('hidden');
}

// Initialize autocomplete for both inputs
setupAutocomplete('departureInput', 'departureDropdown');
setupAutocomplete('arrivalInput', 'arrivalDropdown');

const tripSelect = document.getElementById("tripTypeSelect");
const returnField = document.getElementById("returnField");
const itinerarySection = document.getElementById("itinerarySection");
const selectedFlightsContainer = document.getElementById("selectedFlights");
const clearItineraryBtn = document.getElementById("clearItinerary");

// Search state management
let searchState = {
    isRoundTrip: true,
    outboundSelected: null,
    searchingFor: 'outbound', // 'outbound' or 'return'
    searchParams: null
};

tripSelect.addEventListener("change", () => {
    if (tripSelect.value === "2") {  // One way
        returnField.classList.add("hidden");
        searchState.isRoundTrip = false;
    } else {
        returnField.classList.remove("hidden");
        searchState.isRoundTrip = true;
    }
    // Reset search state when trip type changes
    resetSearchState();
});

function resetSearchState() {
    searchState.outboundSelected = null;
    searchState.searchingFor = 'outbound';
    itinerarySection.classList.add('hidden');
    selectedFlightsContainer.innerHTML = '';
    flightResults.innerHTML = '';
}

clearItineraryBtn.addEventListener('click', resetSearchState);

// Flight Search Form Handler
const flightForm = document.getElementById("flightSearchForm");
const loadingIndicator = document.getElementById("loadingIndicator");
const flightResults = document.getElementById("flightResults");

flightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = {
        departure_id: document.getElementById("departureInput").value.trim().toUpperCase(),
        arrival_id: document.getElementById("arrivalInput").value.trim().toUpperCase(),
        outbound_date: document.getElementById("departureDate").value,
        return_date: document.getElementById("returnDate").value || null,
        adults: document.getElementById("adultsSelect").value,
        travel_class: document.getElementById("classSelect").value,
        type: "2" // Always search one-way, we'll handle round trip manually
    };
    
    // Check if this is a NEW search (different parameters)
    const isNewSearch = !searchState.searchParams || 
                       searchState.searchParams.departure_id !== formData.departure_id ||
                       searchState.searchParams.arrival_id !== formData.arrival_id ||
                       searchState.searchParams.outbound_date !== formData.outbound_date ||
                       searchState.searchParams.return_date !== formData.return_date;
    
    // If new search, reset state
    if (isNewSearch && searchState.searchingFor === 'outbound') {
        resetSearchState();
    }
    
    // Store search params for return flight search
    if (!searchState.searchParams) {
        searchState.searchParams = formData;
    }
    
    // If searching for return flight, swap departure/arrival and use return date
    if (searchState.searchingFor === 'return') {
        formData.departure_id = searchState.searchParams.arrival_id;
        formData.arrival_id = searchState.searchParams.departure_id;
        formData.outbound_date = searchState.searchParams.return_date;
        formData.return_date = null;
    }
    
    // Show loading, hide results
    loadingIndicator.classList.remove("hidden");
    flightResults.innerHTML = "";
    
    try {
        const response = await fetch("/search-flights", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Failed to fetch flights");
        }
        
        displayFlights(data.flights);
    } catch (error) {
        flightResults.innerHTML = `
            <div class="bg-red-900/30 border border-red-500 text-red-200 p-6 rounded-xl">
                <i class="fa-solid fa-circle-exclamation mr-2"></i>
                <strong>Error:</strong> ${error.message}
            </div>
        `;
    } finally {
        loadingIndicator.classList.add("hidden");
    }
});

function selectFlight(flight) {
    if (searchState.searchingFor === 'outbound') {
        // Store outbound flight
        searchState.outboundSelected = flight;
        
        // Display in itinerary
        displayItinerary();
        
        // Check if round trip
        if (searchState.isRoundTrip && searchState.searchParams.return_date) {
            // Switch to return flight search
            searchState.searchingFor = 'return';
            flightResults.innerHTML = `
                <div class="bg-blue-900/30 border border-blue-500 text-blue-200 p-6 rounded-xl text-center">
                    <i class="fa-solid fa-plane-arrival text-3xl mb-3"></i>
                    <p class="text-lg font-semibold">Great! Now select your return flight</p>
                    <button onclick="flightForm.dispatchEvent(new Event('submit'))" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                        Search Return Flights
                    </button>
                </div>
            `;
        } else {
            // One-way booking complete
            flightResults.innerHTML = `
                <div class="bg-green-900/30 border border-green-500 text-green-200 p-6 rounded-xl text-center">
                    <i class="fa-solid fa-check-circle text-3xl mb-3"></i>
                    <p class="text-lg font-semibold">Flight selected! Ready to book.</p>
                </div>
            `;
        }
    } else {
        // Return flight selected - booking complete
        displayItinerary(flight);
        flightResults.innerHTML = `
            <div class="bg-green-900/30 border border-green-500 text-green-200 p-6 rounded-xl text-center">
                <i class="fa-solid fa-check-circle text-3xl mb-3"></i>
                <p class="text-lg font-semibold">Round trip complete! Ready to book.</p>
                <p class="text-sm mt-2">Total: $${(searchState.outboundSelected.price + flight.price).toFixed(0)}</p>
            </div>
        `;
    }
}

function displayItinerary(returnFlight = null) {
    itinerarySection.classList.remove('hidden');
    
    let html = '';
    
    // Display outbound flight
    if (searchState.outboundSelected) {
        html += createItineraryCard(searchState.outboundSelected, 'Outbound');
    }
    
    // Display return flight if provided
    if (returnFlight) {
        html += createItineraryCard(returnFlight, 'Return');
    }
    
    selectedFlightsContainer.innerHTML = html;
}

function createItineraryCard(flight, label) {
    const departureTime = flight.departure_airport?.time?.split(' ')[1] || 'N/A';
    const arrivalTime = flight.arrival_airport?.time?.split(' ')[1] || 'N/A';
    const departureDate = flight.departure_airport?.time?.split(' ')[0] || '';
    const duration = flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A';
    
    return `
        <div class="bg-[#1a2233] border border-blue-500/30 p-4 rounded-lg">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    ${flight.airline_logo ? `<img src="${flight.airline_logo}" alt="${flight.airline}" class="w-8 h-8 object-contain bg-white rounded p-1" />` : ''}
                    <div>
                        <span class="text-xs text-purple-400 font-semibold">${label}</span>
                        <div class="text-sm font-semibold text-white">${flight.airline} ${flight.flight_number || ''}</div>
                        <div class="text-xs text-gray-400">${departureDate}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4 text-sm">
                    <div class="text-center">
                        <div class="font-bold text-white">${departureTime}</div>
                        <div class="text-xs text-gray-400">${flight.departure_airport?.id}</div>
                    </div>
                    <div class="text-center text-gray-400">
                        <i class="fa-solid fa-plane text-blue-400"></i>
                        <div class="text-xs">${duration}</div>
                    </div>
                    <div class="text-center">
                        <div class="font-bold text-white">${arrivalTime}</div>
                        <div class="text-xs text-gray-400">${flight.arrival_airport?.id}</div>
                    </div>
                    <div class="text-lg font-bold text-green-400">$${flight.price}</div>
                </div>
            </div>
        </div>
    `;
}

function displayFlights(flights) {
    if (!flights || flights.length === 0) {
        flightResults.innerHTML = `
            <div class="bg-yellow-900/30 border border-yellow-500 text-yellow-200 p-6 rounded-xl text-center">
                <i class="fa-solid fa-plane-slash text-3xl mb-3"></i>
                <p>No flights found for your search criteria. Try different dates or airports.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="space-y-4">';
    
    flights.forEach((flight, index) => {
        const price = flight.price ? `$${flight.price}` : "N/A";
        const isRoundTrip = flight.type && flight.type.toLowerCase().includes("round");
        
        // Carbon emissions formatting
        const carbonEmissions = flight.carbon_emissions?.this_flight 
            ? `${Math.round(flight.carbon_emissions.this_flight / 1000)} kg CO₂e` 
            : "N/A";
        const carbonDiff = flight.carbon_emissions?.difference_percent || 0;
        const carbonClass = carbonDiff > 0 ? "text-red-400" : carbonDiff < 0 ? "text-green-400" : "text-gray-400";
        const carbonIcon = carbonDiff > 0 ? "↑" : carbonDiff < 0 ? "↓" : "";
        
        // Check if it's a best/top flight
        const isBestFlight = index < 3;
        const bestBadge = isBestFlight ? '<span class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Top Flight</span>' : '';
        
        // Get all flight legs for round trips
        const allLegs = flight.all_flights || [flight];
        
        html += `
            <div class="bg-[#1a2233] border ${isBestFlight ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' : 'border-white/10'} p-6 rounded-xl hover:border-blue-500/50 transition-all duration-300">
                <!-- Header -->
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-4">
                        ${flight.airline_logo ? `<img src="${flight.airline_logo}" alt="${flight.airline}" class="w-12 h-12 object-contain bg-white rounded-lg p-1" />` : ''}
                        <div>
                            <h3 class="text-xl font-bold text-blue-300">${flight.airline || 'Multiple Airlines'}</h3>
                            <p class="text-sm text-gray-400">${flight.type || "Round trip"}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-bold text-green-400 mb-1">${price}</div>
                        ${bestBadge}
                    </div>
                </div>
        `;
        
        // Display each leg of the journey
        allLegs.forEach((leg, legIndex) => {
            const departureTime = leg.departure_airport?.time || "N/A";
            const arrivalTime = leg.arrival_airport?.time || "N/A";
            const duration = leg.duration ? `${Math.floor(leg.duration / 60)}h ${leg.duration % 60}m` : "N/A";
            
            // Extract date from time string (format: "YYYY-MM-DD HH:MM")
            const departureDate = departureTime.split(' ')[0] || '';
            const arrivalDate = arrivalTime.split(' ')[0] || '';
            const departureTimeOnly = departureTime.split(' ')[1] || departureTime;
            const arrivalTimeOnly = arrivalTime.split(' ')[1] || arrivalTime;
            
            // Format dates nicely
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            };
            
            const stopsText = legIndex === 0 ? (flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`) : "";
            const stopsColor = flight.stops === 0 ? "text-green-400" : "text-yellow-400";
            
            html += `
                <!-- Flight Leg ${legIndex + 1} -->
                <div class="mb-4">
                    <div class="grid grid-cols-7 gap-4 items-center">
                        <!-- Departure -->
                        <div class="col-span-2 text-left">
                            <div class="text-xs text-gray-500 mb-1">${formatDate(departureDate)}</div>
                            <div class="text-3xl font-bold text-white">${departureTimeOnly}</div>
                            <div class="text-sm text-gray-400 mt-1 font-semibold">${leg.departure_airport?.id || ""}</div>
                            <div class="text-xs text-gray-500">${leg.departure_airport?.name || ""}</div>
                        </div>
                        
                        <!-- Duration & Stops -->
                        <div class="col-span-3 text-center px-4">
                            <div class="text-sm text-gray-400 mb-2">${duration}</div>
                            <div class="relative">
                                <div class="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
                                <i class="fa-solid fa-plane absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400 bg-[#1a2233] px-2"></i>
                            </div>
                            ${legIndex === 0 && stopsText ? `<div class="text-xs ${stopsColor} font-semibold mt-2">${stopsText}</div>` : '<div class="text-xs text-gray-500 mt-2">&nbsp;</div>'}
                        </div>
                        
                        <!-- Arrival -->
                        <div class="col-span-2 text-right">
                            <div class="text-xs text-gray-500 mb-1">${formatDate(arrivalDate)}</div>
                            <div class="text-3xl font-bold text-white">${arrivalTimeOnly}</div>
                            <div class="text-sm text-gray-400 mt-1 font-semibold">${leg.arrival_airport?.id || ""}</div>
                            <div class="text-xs text-gray-500">${leg.arrival_airport?.name || ""}</div>
                        </div>
                    </div>
                    
                    ${leg.overnight ? '<div class="text-xs text-orange-400 mt-2"><i class="fa-solid fa-moon mr-1"></i>Overnight flight</div>' : ''}
                    
                    <div class="text-xs text-gray-400 mt-2">
                        ${leg.airline || ''} ${leg.flight_number || ''} ${leg.airplane ? `· ${leg.airplane}` : ''}
                    </div>
                </div>
            `;
        });
        
        // Layover info (only for first leg on round trips)
        let layoverInfo = '';
        if (flight.layovers && flight.layovers.length > 0) {
            const layoverDetails = flight.layovers.map(l => 
                `${l.name || l.id} (${Math.floor(l.duration / 60)}h ${l.duration % 60}m)`
            ).join(', ');
            layoverInfo = `
                <div class="text-xs text-gray-400 mt-2 pt-2 border-t border-white/10">
                    <i class="fa-solid fa-clock mr-1"></i>Layover: ${layoverDetails}
                </div>
            `;
        }
        
        html += layoverInfo;
        
        // Perks/Amenities
        if (flight.extensions && flight.extensions.length > 0) {
            html += `
                <div class="flex flex-wrap gap-2 mt-4">
                    ${flight.extensions.slice(0, 4).map(ext => {
                        let icon = "fa-circle-info";
                        let color = "bg-gray-700/50 text-gray-300";
                        
                        if (ext.toLowerCase().includes("legroom")) {
                            icon = "fa-couch";
                            if (ext.toLowerCase().includes("above average")) color = "bg-green-600/20 text-green-300 border border-green-500/30";
                            else color = "bg-blue-600/20 text-blue-300 border border-blue-500/30";
                        } else if (ext.toLowerCase().includes("wi-fi") || ext.toLowerCase().includes("wifi")) {
                            icon = "fa-wifi";
                            color = "bg-purple-600/20 text-purple-300 border border-purple-500/30";
                        } else if (ext.toLowerCase().includes("power") || ext.toLowerCase().includes("usb")) {
                            icon = "fa-plug";
                            color = "bg-yellow-600/20 text-yellow-300 border border-yellow-500/30";
                        } else if (ext.toLowerCase().includes("video") || ext.toLowerCase().includes("entertainment") || ext.toLowerCase().includes("stream")) {
                            icon = "fa-tv";
                            color = "bg-pink-600/20 text-pink-300 border border-pink-500/30";
                        } else if (ext.toLowerCase().includes("carbon")) {
                            icon = "fa-leaf";
                            color = "bg-green-600/20 text-green-300 border border-green-500/30";
                        }
                        
                        return `<span class="${color} px-3 py-1 rounded-full text-xs flex items-center gap-1.5">
                            <i class="fa-solid ${icon}"></i>
                            ${ext}
                        </span>`;
                    }).join('')}
                </div>
            `;
        }
        
        // Bottom info bar
        html += `
                <!-- Additional Info -->
                <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <div class="flex items-center gap-6 text-sm">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-leaf text-green-400"></i>
                            <span class="text-gray-300">${carbonEmissions}</span>
                            ${carbonDiff !== 0 ? `<span class="${carbonClass} font-semibold text-xs">${carbonIcon}${Math.abs(carbonDiff)}%</span>` : ''}
                        </div>
                    </div>
                    <button onclick='selectFlight(${JSON.stringify(flight).replace(/'/g, "&#39;")})' class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                        ${searchState.searchingFor === 'outbound' ? 'Select Outbound' : 'Select Return'}
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    flightResults.innerHTML = html;
}
