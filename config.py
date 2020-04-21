class Config(object):
	DEBUG = False
	TESTING = False
	SERVE_FILES = True
	MONGO_URI = ""
	MONGO_SERVER_SELECTION_TIMEOUT_MS = 100

class Prod(Config):
	MONGO_URI = "mongodb://192.168.0.12:27017/asteroid"

class Dev(Config):
	DEBUG = True
	#MONGO_URI = "mongodb://192.168.0.96:8934/asteroid"
	MONGO_URI = "mongodb://192.168.0.12:27017/asteroid"
	SERVE_FILES = True

class TestAPI(Config):
	TESTING = True
	MONGO_URI = ""
	SERVE_FILES = True