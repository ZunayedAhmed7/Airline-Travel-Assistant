import os
from flask import Flask, jsonify, render_template, send_from_directory

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

@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('../frontend/images', filename)

if __name__ == "__main__":
    app.run(debug=True)



