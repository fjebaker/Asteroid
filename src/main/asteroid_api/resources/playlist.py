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
    'song': fields.Nested(mSongInfo),
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

mPlayList = {'public_playlists':fields.List(fields.Nested(mPlayInfo))}

new_vote_parser = reqparse.RequestParser()
new_vote_parser.add_argument('vote', type=int, required=False)
new_vote_parser.add_argument('u_id', type=int, required=False)
new_vote_parser.add_argument('s_id', type=int, required=False)

new_playlist_parser = reqparse.RequestParser()
new_playlist_parser.add_argument('name', type=str, required=True)
new_playlist_parser.add_argument('owner', type=str, required=True)
new_playlist_parser.add_argument('privacy', type=str, required=True, choices=("viewable", "editable", "private"))
new_playlist_parser.add_argument('clone_target', type=str, required=False)

playlist_patch_parser = reqparse.RequestParser()
playlist_patch_parser.add_argument('name', type=str, required=False)
playlist_patch_parser.add_argument('privacy', type=str, required=False)

class PlaylistsDB(Resource):
    """ Class for handling interactions relating to playlists """
    mPlayInfoTemplate = ['_id','privacy','data']
    mPlayDataTemplate = ['name','owner','size']
    mSongInfoTemplate = ['name', 'artist', 's_id', 'duration']

    @marshal_with(mPlayList)
    def _get_public(self):
        """ GET at /playlists; returns info (excluding songs) on all public playlists """
        query_result = mongo.db.playlists.find(
            {'privacy':{'$in':['viewable','editable']}},
            {'privacy':1,'data.name':1,'data.owner':1,'data.size':1}
        )
        query_result = [{k:v for k,v in i.items() if k in self.mPlayInfoTemplate} for i in query_result]
        for i in query_result:
            i['_id'] = str(i['_id'])
            for k,v in i.pop('data').items():
                i[k] = v
        return {'public_playlists':query_result}

    @marshal_with(mPlay)
    def _get_by_hash(self,hashkey):
        """ GET at /playlists/<hashkey>; returns playlist info & songs """
        _id = ObjectId(hashkey)
        try:
            playlist = mongo.db.playlists.find({'_id':_id}).next()
        except StopIteration:
            return {}, 400
        #Update with new songs & removed songs
        content = playlist['data'].pop('content')
        #Note: there should be no overlap between 'songs_to_add' and 'songs_to_remove', but better safe than sorry, ey
        song_ids_to_add = [item for item in content['songs_to_add'] if item not in content['songs_to_remove']]
        song_ids_to_remove = [item.s_id for item in content['songs'] if item.s_id in content['song_ids_to_remove']]
        if len(song_ids_to_add) > 0:
            songs_to_add = mongo.db.songs.find({'s_id':{'$in':song_ids_to_add}})
            songs_to_add = [{k:v for k,v in i.items() if k in self.mSongInfoTemplate} for i in songs_to_add]
            mongo.db.playlists.update(
                {'_id':_id},
                {
                    '$push':{'data.content.songs':{'$each':songs_to_add}},
                    '$pull':{'data.content.songs':{'s_id':{'$in':song_ids_to_remove}}},
                    '$set':{
						'data.content.songs_to_add':[],
						'data.content.songs_to_remove':[],
						'data.content.size':len(content['songs'])+len(songs_to_add)-len(song_ids_to_remove)
					}
                }
            )
        else:
            songs_to_add = []
            if len(song_ids_to_remove) > 0:
                mongo.db.playlists.update(
                	{'_id':_id},
                	{
                    	'$pull':{'data.content.songs':{'s_id':{'$in':song_ids_to_remove}}},
                    	'$set':{
							'data.content.songs_to_add':[],
							'data.content.songs_to_remove':[],
							'data.content.size':len(content['songs'])-len(song_ids_to_remove)
						}
                	}
            	)
        item = {}
        item['songs'] = [item for item in content['songs'] if item.s_id not in content['songs_to_remove']]+songs_to_add
        item['info'] = {k:v for k,v in playlist.items() if k in self.mPlayInfoTemplate}
        for k,v in item['info'].pop('data').items():
            item['info'][k] = v
        item['info']['_id'] = str(item['info']['_id'])
        return item

    @marshal_with(mSongInfo)
    def _get_by_s_id(self,hashkey,s_id):
        """ GET at /playlists/<hashkey>/songs/<s_id>.
            Dunno why anyone would need this, but returns song info if in playlist """
        playlist = self._get_by_hash(hashkey)
        try:
            songs = playlist['songs']
        except:
            return playlist
        matches = [song for song in songs if str(song['s_id']) == s_id]
        if len(matches) is 0:
            return {}, 400
        elif len(matches) is 1:
            return matches[0]
        else:
            return {}, 500

    @marshal_with(mPlayInfo)
    def _post_new_list(self,args):
        """ POST at /playlists; if created, returns playlist info (excluding songs) """
        if (args['clone_target'] is not None):
            clone_target = self._get_by_hash(args['clone_target'])
            try:
                songs = clone_target['songs']
            except:
                return clone_target
        else:
            songs = []
        args['size'] = len(songs)
        database_item = {k:v for k,v in args.items() if k in self.mPlayInfoTemplate}
        database_item['data'] = {k:v for k,v in args.items() if k in self.mPlayDataTemplate}
        database_item['data']['content'] = {'songs':songs,'songs_to_add':[],'songs_to_remove':[]}
        database_item['data']['size'] = args['size']
        args['_id'] = str(mongo.db.playlists.insert_one(database_item).inserted_id)
        return args

    def _put_new_songs(self,hashkey,s_id):
        """ PUT at /playlists/<hashkey>/songs/<s_id>; adds song(s) with given s_id to playlist """
        _id = ObjectId(hashkey)
        try:
            s_ids = [int(item) for item in s_id.split(' ')]
            mongo.db.update(
                {'_id':_id},
                {
                    '$push':{'data.content.songs_to_add':{'$each':s_ids}},
					'$pull':{'data.content.songs_to_remove':{'$each':s_ids}},
                    '$inc':{'data.size':len(s_ids)}
                }
            )
        except:
            return {},400

    def _patch_info(self,hashkey,args):
        """ PATCH at /playlists/<hashkey>; modifies privacy or name """
        _id = ObjectId(hashkey)
        try:
            if (args['name'] is not None):
                mongo.db.playlists.update({'_id':_id},{'$set':{'data.name':args['name']}})
            if (args['privacy'] is not None):
                mongo.db.playlists.update({'_id':_id},{'$set':{'privacy':args['privacy']}})
        except:
            return {},400

    def _delete_playlist(self,hashkey):
        """ DELETE at /playlists/<hashkey>; deletes playlist """
        _id = ObjectId(hashkey)
        mongo.db.playlists.remove({'_id':_id})

    def _delete_songs_from_playlist(self,hashkey,s_id):
        """ DELETE at /playlists/<hashkey>/songs/<s_id>; removes specified song(s) from playlist """
        _id = ObjectId(hashkey)
        try:
            s_ids = [int(item) for item in s_id.split(' ')]
            mongo.db.update(
                {'_id':_id},
                {
                    '$push':{'data.content.songs_to_remove':{'$each':s_ids}},
					'$pull':{'data.content.songs_to_add':{'$each':s_ids}},
                    '$inc':{'data.size':-len(s_ids)}
                }
            )
        except:
            return {},400

    def get(self,hashkey=None,s_id=None):
        if hashkey is None:
            return self._get_public()
        elif s_id is None:
            return self._get_by_hash(hashkey)
        else:
            return self._get_by_s_id(hashkey,s_id)

    def post(self,hashkey=None,s_id=None):
        if hashkey is None:
            args = new_playlist_parser.parse_args(strict=True)
            return self._post_new_list(args)
        else:
            return {}, 405

    def put(self,hashkey=None,s_id=None):
        if hashkey is None or s_id is None:
            return {}, 405
        else:
            return self._put_new_songs(hashkey,s_id)

    def patch(self,hashkey=None,s_id=None):
        if hashkey is None or s_id is not None:
            return {}, 405
        else:
            args = playlist_patch_parser.parse_args(strict=True)
            return self._patch_info(hashkey,args)

    def delete(self,hashkey=None,s_id=None):
        if hashkey is None:
            return {}, 405
        elif s_id is None:
            return self._delete_playlist(hashkey)
        else:
            return self._delete_songs_from_playlist(hashkey,s_id)

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
