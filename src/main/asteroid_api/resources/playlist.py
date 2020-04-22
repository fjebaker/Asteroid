from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with

from src.main.asteroid_api.common.__database import mongo
from bson.objectid import ObjectId

mSongInfo = {
    'name': fields.String,
    'artist': fields.String,
    's_id': fields.Integer,
    'duration': fields.Float
}

mSong = {
    'song': fields.Nested({
        'name': fields.String,
        'artist': fields.String,
        's_id': fields.Integer,
    }),
    'u_id': fields.Integer,
    'vote': fields.Integer
}

mPlayInfo = {
    '_id': fields.String,
    'owner': fields.String,
    'name': fields.String,
    'privacy': fields.String,
    'size': fields.Integer
}

mPlay = {
    'info': fields.Nested(mPlayInfo),
    'songs': fields.List(fields.Nested(mSongInfo))
}

mPlayList = fields.List(fields.Nested(mPlayInfo))

new_vote_parser = reqparse.RequestParser()
new_vote_parser.add_argument('vote', type=int, required=False)
new_vote_parser.add_argument('u_id', type=int, required=False)
new_vote_parser.add_argument('s_id', type=int, required=False)

new_playlist_parser = reqparse.RequestParser()
new_playlist_parser.add_argument('name', type=str, required=True)
new_playlist_parser.add_argument('owner', type=str, required=True)
new_playlist_parser.add_argument('privacy', type=str, required=True)
new_playlist_parser.add_argument('clone_target', type=str, required=False)

playlist_patch_parser = reqparse.RequestParser()
playlist_patch_parser.add_argument('name', type=str, required=False)
playlist_patch_parser.add_argument('privacy', type=str, required=False)

class PlaylistsDB(Resource):
    """ Class for handling interactions relating to playlists """

    @marshal_with(mPlayList)
    def get(self):
        return mongo.db.publicplaylists.find()

    @marshal_with(mPlayInfo)
    def post(self):
        args = new_playlist_parser.parse_args(strict=True)
        is_public = False
        if (args["privacy"] == "viewable" or args["privacy"] == "editable"):
            is_public = True
        elif (args["privacy"] != "private"):
            return {},400
        if (args["clone_target"] is not None):
            try:
                clone_target = mongo.db.playlists.find({'_id':ObjectId(args["clone_target"])}).next()
            except StopIteration:
                return {},400
            args["songs"] = clone_target["songs"]
        else:
            args["songs"]=[]
        del args["clone_target"]
        args["unchecked_songs"]=[]
        args["_id"] = mongo.db.playlists.insert_one(args).inserted_id
        if (is_public):
            mongo.db.publicplaylists.insert_one(args)
        args["_id"] = str(args["_id"])
        del args["songs"]
        return args

class PlaylistDB(Resource):
    """ Class for handling interactions relating to a particular playlist """

    @marshal_with(mPlay)
    def get(self,hashkey,s_id=None):
        """ GET endpoint; returns playlist specified by hashkey """
        _id = ObjectId(hashkey)
        try:
            playlist = mongo.db.playlists.find({'_id':_id}).next()
        except StopIteration:
            return {},400
        #Update with unchecked songs
        if len(playlist["unchecked_songs"]) > 0:
            adding_songs = mongo.db.songs.find({'$or':[{'s_id':song_id} for song_id in playlist["unchecked_songs"]]})
            adding_songs = [{
                'name': adding_song['name'],
                'artist': adding_song['artist'],
                's_id': adding_song['s_id'],
                'duration': adding_song['duration']
                } for adding_song in adding_songs ]
            mongo.db.playlists.update({'_id':_id},{'$push':{'songs':{'$each': adding_songs}}})
            mongo.db.playlists.update({'_id':_id},{'$set':{'unchecked_songs':[]}})
        else:
            adding_songs = []
        item = {}
        item['songs'] = playlist.pop('songs')+adding_songs
        playlist['_id'] = hashkey
        playlist['size'] = len(item['songs'])+len(adding_songs)
        item['info'] = playlist
        return item

    def delete(self,hashkey,s_id=None):
        """ DELETE endpoint; deletes playlist specified by hashkey, or,
            if s_id specified, removes song with id s_id from playlist
            specified by hashkey.                                       """
        _id = ObjectId(hashkey)
        if (s_id is None):
            mongo.db.playlists.remove({'_id':_id})
        else:
            mongo.db.playlists.update({'_id':_id},{'$pull':{songs:{'s_id':s_id}}})

    def put(self,hashkey,s_id):
        """ PUT endpoint; adds song with id s_id to playlist specified by hashkey """
        _id = ObjectId(hashkey)
        try:
            mongo.db.playlists.update({'_id':_id},{'$push':{'unchecked_songs':int(s_id)}})
        except TypeError:
            return {},400

    def patch(self,hashkey,s_id=None):
        """ PATCH endpoint; updates playlist info for playlist specified by hashkey """
        args = playlist_patch_parser.parse_args(strict=True)
        _id = ObjectId(hashkey)
        if (args['name'] is not None):
            mongo.db.playlists.update({'_id':_id},{'$set':{'name':args['name']}})
        if (args['privacy'] is not None):
            try:
                playlist = mongo.db.playlists.find({'_id':_id}).next()
            except StopIteration:
                return {},400
            old_privacy = playlist['privacy']
            mongo.db.playlists.update({'_id':_id},{'$set':{'privacy':args['privacy']}})
            if (old_privacy == 'private' and args['privacy'] != 'private'):
                del playlist["songs"]
                mongo.db.publicplaylists.insert_one(playlist)
            elif (old_privacy != 'private' and args['privacy'] == 'private'):
                mongo.db.publicplaylists.remove({'_id':_id})

class QueueDB(Resource):
    """ Class for handling interactions with fetching from queue database """

    @marshal_with(mSong)
    def get(self):
        """ GET endpoint; performs database query depending on the parsed arguments """
        return list(mongo.db.queue.find().sort('vote', -1).limit(40))

class Vote(Resource):
    """ Class for handling interactions for adding to queue """

    def _find_song(self, s_id):
        """ find the song with s_id in the songs database """
        return mongo.db.songs.find({'s_id':s_id}).next()

    def _update(self, s_id, vote):
        """ if already in database, update vote and return item, else return None """
        try:
            res = mongo.db.queue.find({'song.s_id':s_id}).next()
        except StopIteration:
            return None
        mongo.db.queue.update(
            {'_id' : res.get('_id')}, 
            {'$inc':{'vote':vote}}
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

        in_playist = self._update(s_id, args['vote'])
        if in_playist is not None:
            return in_playist

        item = {'song':song, **args}
        mongo.db.queue.insert_one(item)

        return item
