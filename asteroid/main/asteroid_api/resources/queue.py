from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with

from asteroid.main.asteroid_api.common.__database import mongo

mSongInfo = {
    'name': fields.String,
    'artist': fields.String,
    's_id': fields.Integer,
    'duration':fields.Float
}

mSong = {
    'song': fields.Nested(mSongInfo),
    'u_id': fields.Integer,
    'vote': fields.Integer
}

new_vote_parser = reqparse.RequestParser()
new_vote_parser.add_argument('vote', type=int, required=False)
new_vote_parser.add_argument('u_id', type=int, required=False)
new_vote_parser.add_argument('s_id', type=int, required=False)

class QueueDB(Resource):
    """ Class for handling interactions with fetching from queue database """

    @marshal_with(mSong)
    def get(self):
        """ GET endpoint; performs database query for queue """
        return list(mongo.db.songs.find().sort('vote',-1).limit(40))

class Vote(Resource):
    """ Class for handling interactions for adding to the queue """

    def _find_song(self,s_id):
        """ find the song with s_id in the songs database """
        return mongo.db.songs.find({'s_id':s_id}).next()

    def _update(self,s_id,vote):
        """ if already in database, update vote and return item, else return None """
        try:
            res = mongo.db.queue.find({'song.s_id':s_id}).next()
        except StopIteration:
            return None
        mongo.db.queue.update(
            {'_id' : res.get('_id')},
            {'$inc' : {'vote':vote}}
        )
        res['vote'] += vote
        return res

    @marshal_with(mSong)
    def post(self):
        args = new_vote_parser.parse_args(strict=True)
        s_id = args['s_id']
        try:
            song = self._find_song(s_id)
        except StopIteration:
            return {}, 400
        else:
            del args['s_id']

        in_playlist = self._update(s_id, args['vote'])
        if in_playlist is not None:
            return in_playlist

        item = {'song':song, **args}
        mongo.db.queue.insert_one(item)

        return item
