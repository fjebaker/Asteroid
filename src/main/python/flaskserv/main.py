from flask import Flask, redirect, request, url_for, Response, send_from_directory
import src.main.python.flaskserv.QueryHandlers as queryhandle
import src.main.python.flaskserv.FormHandlers as formhandle
import importlib
app = Flask(__name__)

@app.route("/")
def index():
	query_string = request.query_string 
	return send_from_directory('../../web/static/html', 'home.html')

@app.route("/auth")
def auth():
	return send_from_directory('../../web/static/html', 'auth.html')

# want to get rid of this
#@app.route("/<name>.html")
#def htmls(name):
#	return send_from_directory('../../web/static/html', name + '.html')

@app.route("/script/<name>.js")
def scripts(name):
	return send_from_directory('../../web/static/script', name+'.js')

@app.route("/register", methods=["POST"])
def register_user():
	importlib.reload(formhandle)	# DEBUG
	return formhandle.UserRegister(request)()

@app.route("/db/music")
def music_db():
	importlib.reload(queryhandle)	# DEBUG
	query_string = request.query_string 
	print(query_string)
	return queryhandle.MusicQuery(query_string)() 

@app.route("/db/users")
def user_db():
	importlib.reload(queryhandle)	# DEBUG
	query_string = request.query_string 
	print(query_string)
	return queryhandle.UserQuery(query_string)() 

if __name__ == "__main__":
	app.run("localhost", 8080)
