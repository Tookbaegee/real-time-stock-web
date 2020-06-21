from app import current_app as app

if __name__ == "__main__":
    app.run(threaded=True, port=5000)