from flask import Blueprint
from flask_restful import Api, Resource

from asteroid.main.asteroid_api.resources import *

api_bp = Blueprint('api', __name__)
api = Api(api_bp)


api.add_resource(UserDB, '/db/users')
api.add_resource(UserRegister, '/register')
api.add_resource(SongDB, '/db/songs')
api.add_resource(QueueDB, '/vote')
api.add_resource(Vote, '/vote')
api.add_resource(PlaylistsDB, '/db/playlists', '/db/playlists/<string:hashkey>', '/db/playlists/<string:hashkey>/songs/<string:s_id>')
