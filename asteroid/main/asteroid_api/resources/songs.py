from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with

from asteroid.main.asteroid_api.common.__database import mongo

mSong = {
    'name': fields.String,
    'artist': fields.String,
    's_id': fields.Integer,
    'duration': fields.Float
}

search_song_parser = reqparse.RequestParser()
search_song_parser.add_argument('name')
search_song_parser.add_argument('artist')
search_song_parser.add_argument('s_id', location='args')

class SongDB(Resource):
    """ Class for handling interactions with fetching from songs database """

    def _format_query(self, _dict):
        """ Formatter for fascilitating regex and in expressions """
        res = {}
        for k,v in _dict.items():
            if v is None:
                continue
            if k == 's_id':
                res[k] = {'$in': [int(i) for i in v.split(' ')]}
            if k == 'name' or k == 'artist':
                res[k] = {"$regex": v, "$options": "-i"}
        return res

    @marshal_with(mSong)
    def get(self):
        """ GET endpoint; performs database query depending on the parsed arguments """
        try:
            args = self._format_query(
                search_song_parser.parse_args(strict=True)
            )
        except:
            return {}, 200
        return list(mongo.db.songs.find(args).limit(40))


