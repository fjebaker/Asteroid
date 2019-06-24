from flask import Flask, redirect, request, send_from_directory
from src.main.web.flaskserv import MusicQuery, UserQuery, UserHandler
from src.main.web.flaskserv import Vote, Playlist
import importlib
app = Flask(__name__)

@app.route("/")
def index():
	query_string = request.query_string 
	return send_from_directory('../../web/static/html', 'home.html')

@app.route("/auth")
def auth():
	return send_from_directory('../../web/static/html', 'auth.html')

@app.route("/css/<name>.css")
def styles(name):
	return send_from_directory('../../web/static/css', name + '.css')

@app.route("/script/<name>.js")
def scripts(name):
	return send_from_directory('../../web/static/script', name+'.js')

@app.route("/config/jsconfig.js")
def jsconfig():
    return send_from_directory('../../web/dynamic','jsconfig.js')

@app.route("/resources/images/<name>")
def images(name):
	return send_from_directory('../../web/static/resources/images', name)

@app.route("/register", methods=["POST"])
def register_user():
	return UserHandler(request)()

@app.route("/vote", methods=["GET", "POST"])
def vote():
	return Vote(request)()

@app.route("/rate", methods=["POST"])
def rate():
	return "TODO"

@app.route("/db/music")
def music_db():
	query_string = request.query_string
	return MusicQuery(query_string)()

@app.route("/db/users")
def user_db():
	query_string = request.query_string
	return UserQuery(query_string)()

# TODO
def admin():
	pass
