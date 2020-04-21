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

"""

import pymongo
from pymongo.errors import ServerSelectionTimeoutError
if __name__ == '__main__':
print(app.config['MONGO_URI'])
try:
	c=pymongo.MongoClient(
		app.config['MONGO_URI'], 
		serverSelectionTimeoutMS=app.config['MONGO_SERVER_SELECTION_TIMEOUT_MS']
	)
	# print(c.server_info())
except ServerSelectionTimeoutError:
	print("FAULTY DATABASE CONNECTION")
	exit(1)

app.run()
"""