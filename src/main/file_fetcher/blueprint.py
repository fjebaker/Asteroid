from flask import Blueprint, Response
import os

STATIC_FOLDER = "src/static/"
fetcher_bp = Blueprint('fetcher', __name__)

def _from_dir(_dir, name, _bytes=''):
	path = os.path.join(STATIC_FOLDER, _dir, name)
	try:
		with open(path, 'r'+_bytes) as f:
			content = f.read()
	except Exception as e:
		print(e)
	else:
		return content

@fetcher_bp.route("/")
def index(): return _from_dir('html', 'home.html')

@fetcher_bp.route("/auth")
def auth(): return _from_dir('html', 'auth.html')

@fetcher_bp.route("/css/<name>.css")
def styles(name): return Response(_from_dir('css', name + '.css'), mimetype='text/css')

@fetcher_bp.route("/script/<name>.js")
def scripts(name): return _from_dir('script', name+'.js')

@fetcher_bp.route("/tabs/<name>.js")
def tabs(name): return _from_dir('script/tabs', name+'.js')

@fetcher_bp.route("/config/jsconfig.js")
def jsconfig(): return _from_dir('', 'jsconfig.js')

@fetcher_bp.route("/resources/images/<name>")
def images(name): return _from_dir('resources/images', name, _bytes='b')