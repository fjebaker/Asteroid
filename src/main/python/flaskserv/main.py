from flask import Flask, redirect, request, url_for, Response, send_from_directory
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

if __name__ == "__main__":
	app.run("localhost", 8080)
