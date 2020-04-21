from flask import Flask
from flask_restful import Api

from src.main.asteroid_api import api_bp
from src.main.file_fetcher import fetcher_bp
from src.main.asteroid_api.common.__database import mongo


CONFIG_FILE = "config.Dev"

print("\n* CONFIG_FILE = {}\n".format(CONFIG_FILE))

app = Flask(__name__, static_folder='src/static', static_url_path='')
app.config.from_object(CONFIG_FILE)

if app.config['SERVE_FILES']:
	print("SERVING FILES")
	app.register_blueprint(fetcher_bp)


app.register_blueprint(api_bp)
mongo.init_app(app)