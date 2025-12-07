import os
from flask import Flask, jsonify, render_template, send_from_directory, request
from backend.flight_api import search_flights

#Set templates directory relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend', 'Templates'))

app = Flask(__name__, 
	template_folder='../frontend/Templates',
	static_folder='../frontend/static'
)


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/health')
def health():
	return jsonify(status='ok', message='Backend reachable')


@app.route('/search-flights', methods=['POST'])
def search_flights_endpoint():
	"""
	Endpoint to search for flights using SerpAPI
	Expects JSON payload with flight search parameters
	"""
	try:
		data = request.get_json()
		
		print("=" * 50)
		print("Received flight search request:")
		print(f"Request data: {data}")
		print("=" * 50)
		
		# Validate required fields
		required_fields = ['departure_id', 'arrival_id', 'outbound_date']
		for field in required_fields:
			if not data.get(field):
				return jsonify({'error': f'Missing required field: {field}'}), 400
		
		# Extract parameters
		departure_id = data.get('departure_id')
		arrival_id = data.get('arrival_id')
		outbound_date = data.get('outbound_date')
		return_date = data.get('return_date')
		adults = int(data.get('adults', 1))
		travel_class = int(data.get('travel_class', 1))
		flight_type = int(data.get('type', 1))
		
		print(f"Searching flights: {departure_id} -> {arrival_id}")
		print(f"Dates: {outbound_date} to {return_date}")
		print(f"Adults: {adults}, Class: {travel_class}, Type: {flight_type}")
		
		# Search for flights
		flights = search_flights(
			departure_id=departure_id,
			arrival_id=arrival_id,
			outbound_date=outbound_date,
			return_date=return_date,
			adults=adults,
			travel_class=travel_class,
			flight_type=flight_type
		)
		
		return jsonify({
			'success': True,
			'flights': flights,
			'count': len(flights)
		})
	
	except ValueError as ve:
		return jsonify({'error': str(ve)}), 400
	except Exception as e:
		return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('../frontend/images', filename)


@app.route('/api/airports')
def get_airports():
	"""Return airport codes for autocomplete"""
	import json
	with open('airportCodes.json', 'r', encoding='utf-8') as f:
		airports = json.load(f)
	return jsonify(airports)


if __name__ == "__main__":
    app.run(debug=True)



