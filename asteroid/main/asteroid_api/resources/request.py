import importlib, os

from flask import request, Response
from flask_restful import Resource, reqparse, fields, marshal_with

from asteroid.main.asteroid_api.common.__database import mongo

from asteroid.main.databasebuilder import RequestConfig, Config

mSongInfo = {
    'name': fields.String,
    'artist': fields.String,
    's_id': fields.String,
    'duration': fields.String
}

class Request(Resource):
    """ Class for handling generalised song requests """

    @marshal_with(mSongInfo)
    def post(self,request_name=None):
        """ POST request; requests a song from requester configured with request_name """
        if request_name is not None:
            req = RequestConfig()
            requester_module_name = req.get(request_name,"module-name")
            requester = importlib.import_module("request_modules."+requester_module_name)
            parser = requester.get_parser(req[request_name])
            kwargs = parser.parse_args(strict=True)
            song = requester.get_song(req[request_name],**kwargs)
            song["meta_dat"] = {"setup":req[request_name],"request":kwargs}
            #get the current song ID
            try:
                s_id = mongo.db.songs.find().sort('s_id', -1).next()
                song["s_id"] = s_id.get('s_id') + 1
            except StopIteration:
                song["s_id"] = 1
            mongo.db.songs.insert_one(song)
            return song
        else:
            return {},405

    def get(self,request_name=None):
        """ GET request; gets the .js code which adds in the code for this requester, or names of all requesters """
        req = RequestConfig()
        if request_name is None:
            return req.sections()
        else:
            requester_module_name = req.get(request_name,"module-name")
            path = os.path.join("request_modules",requester_module_name,"tab.js")
            content = 'REQUEST.addRequestPage("{}",function()'.format(request_name)
            content = content + "{\n"
            try:
                with open(path,'r') as f:
                    content = content + f.read()
            except Exception as e:
                print(e)
            else:
                content = content + "\n});\n\nLOADER.loading_callback();"
                return Response(content, mimetype = 'text/javascript')
