from flask import Flask, redirect, request, send_from_directory, Response
import requests
from src.main.web.flaskserv import MusicQuery, UserQuery, UserHandler, request_song
from src.main.web.flaskserv import Vote
app = Flask(__name__)


@app.route("/")
def index():
    query_string = request.query_string
    return send_from_directory('../../web/static/html', 'home.html')


@app.route("/auth")
def auth():
    return send_from_directory('../../web/static/html', 'auth.html')


@app.route("/autoqueue")
def autoqueue():
    return send_from_directory('../../web/static/html', 'autoqueue.html')


@app.route("/css/<name>.css")
def styles(name):
    return send_from_directory('../../web/static/css', name + '.css')


@app.route("/script/<name>.js")
def scripts(name):
    return send_from_directory('../../web/static/script', name+'.js')


@app.route("/config/jsconfig.js")
def jsconfig():
    return send_from_directory('../../web/dynamic', 'jsconfig.js')


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


@app.route("/request", methods=["POST"])
def request_new_song():
    """Request a new song to be added to the server.

    :return: HTTP status code: `201` if website exists, `400` if website
    doesn't exist or is invalid, otherwise `500`
    :rtype: flask.Response
    """
    status = 500
    try:
        json = request.form
        if not isinstance(json, dict):
            raise TypeError
        url = json['url']
        if not isinstance(url, str):
            raise TypeError
        request_song.request_song(url)
        status = 201
    except TypeError as e:
        status = 400
    except requests.exceptions.MissingSchema as e:
        print(f"{e}: '{url}' is an invalid URL")
        status = 400
    except requests.exceptions.ConnectionError as e:
        print(f"{e}: Failed to connect to '{url}'")
        status = 400
    return Response(status=status)


def admin():
    pass
