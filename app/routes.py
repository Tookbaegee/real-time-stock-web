from app import current_app as app
from flask import request, render_template, jsonify, after_this_request
import os, requests
from dotenv import load_dotenv

load_dotenv()

@app.route('/')
def index():
    
    return render_template('index.html', title="Real Time Stock Price Chart")

"""
    GET api endpoint that returns the price of a stock. Takes stock name from url as input.
"""
@app.route('/stockPrice/<stockName>', methods=["GET"])
def getStockPrice(stockName):
    #allows same-origin call. (internal js file calling the api)
    @after_this_request
    def add_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    #load environment variable from .env file for API_KEY
    

    #IEX API URL to endpoint for single stock price. API key stored in .env file.
    url = "https://sandbox.iexapis.com/stable/stock/{}/price?token=".format(stockName) + os.getenv("API_KEY")
    
    
    #HTTP request&response error handling
    try:
        response = requests.get(url = url)
    except requests.exceptions.RequestException as e:
        return jsonify({'price': 0, 'error': e})
    

    return jsonify({'price': response.json(), 'error': None})

"""
    GET api endpoint that returns the prices of batch of stocks. Takes stock names from url as input.
"""
@app.route('/stockBatchPrice/<stockNames>', methods=["GET"])
def getStockBatchPrice(stockNames):

    #IEX API URL to endpoint for prices of a batch stocks. API key stored in .env file.
    #Stock name separated by comma.
    url = "https://sandbox.iexapis.com/stable/stock/market/batch?symbols={}&types=price&token=".format(stockNames) + os.getenv("API_KEY")
    try:
        response = requests.get(url = url)
    except requests.exceptions.RequestException as e:
        return jsonify({'error': {'price': 0}, 'error': e})
    

    return jsonify(response.json())