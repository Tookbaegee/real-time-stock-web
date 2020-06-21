from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    return app

current_app = create_app()

import app.routes
