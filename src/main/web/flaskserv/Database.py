from pymongo import MongoClient
from src.main.databasebuilder.setupfuncs import db_address

from functools import wraps
from types import FunctionType

def toList(method):
    @wraps(method)
    def wrapped(*args, **kwargs):
        return list(method(*args, **kwargs))
    return wrapped


class TranslationMeta(type):
    def __new__(meta, classname, bases, classDict):
        newClassDict = {}
        for attributeName, attribute in classDict.items():
            if isinstance(attribute, FunctionType) and 'get' in attributeName:
                attribute = toList(attribute)
            newClassDict[attributeName] = attribute
        return type.__new__(meta, classname, bases, newClassDict)


class MusicDB(metaclass=TranslationMeta):
    
    def __init__(self):
        addr, port = db_address()
        self._client = MongoClient(addr, port=port)
        self.session = self._client.asteroid.songs

    def add_song(self, song):
        s = self.get_page(n=1)
        if len(s) == 0:
            s_id = 0
        else:
            s_id = s[0].get('s_id') + 1
        self.session.insert_one({**song, **{"s_id":s_id}})

    def get_by_name(self, name):
        return self.session.find(
            { "name":
                {
                    "$regex": name,
                    "$options": "-i"
                }
            },
            limit=40
        )

    def get_by_artist(self, artist):
        return self.session.find(
            { "artist":
                {
                    "$regex": artist,
                    "$options": "-i"
                }
            },
            limit=40
        )

    def get_by_name_and_artist(self, name, artist):
        return self.session.find(
            { "name":
                {
                    "$regex": name,
                    "$options": "-i"
                },
              "artist":
                {
                    "$regex": artist,
                    "$options": '-i'
                }
            },
            limit=40
        )
        
    def get_by_id(self, *args):
        return self.session.find(
            { "s_id":
                {
                    "$in": args,
                }
            },
            limit=40
        )    

    def get_page(self, n=40):
        return self.session.find(
            { "$query": {}, 
              "$orderby": 
                { 
                    "s_id" : -1 
                } 
            },
            limit=n
        )
        
    def get_all_songs(self):
        return self.session.find({})

    def __del__(self):
        self._client.close()

class UserDB(metaclass=TranslationMeta): 

    def __init__(self):
        addr, port = db_address()
        self._client = MongoClient(addr, port=port)
        self.session = self._client.asteroid.users

    def add_user(self, user):
        u = self.get_latest_user()
        if len(u) == 0:
            u_id = 0
        else:
            u_id = u[0].get("u_id") + 1
        print("NEW UID = ", u_id)
        self.session.insert_one({**user, **{"u_id":u_id}})
        return u_id

    def get_by_id(self, *args):
        return self.session.find(
            { "u_id":
                {
                    "$in": args,
                }
            },
            limit=40
        )
        
    def get_all_users(self):
        return self.session.find({})
        
    def get_latest_user(self):
        return self.session.find(
            { "$query": {}, 
              "$orderby": 
                { 
                    "u_id" : -1 
                } 
            },
            limit=1 
        )
        
    def __del__(self):
        self._client.close()

class Playlist(metaclass=TranslationMeta): 

    def __init__(self):
        addr, port = db_address()
        self._client = MongoClient(addr, port=port)
        self.session = self._client.asteroid.playlist

    def add(self, item):
        self.session.insert_one(item)

    def get_playlist(self):
        return self.session.find({})
        

    def update_vote(self, s_id, vote):
        self.session.update_one({
                "s_id": s_id
            },
            {
                "$inc": { "vote":vote }
            }
        )
        
    def get_most_voted(self):
        return self.session.find(
            { "$query": {}, 
              "$orderby": 
                { 
                    "vote" : -1 
                } 
            },
            limit=1 
        )

    def remove(self, s_id):
        self.session.delete_one({'s_id':s_id})

    def __del__(self):
        self._client.close()

class History(): 

    def __init__(self):
        addr, port = db_address()
        self._client = MongoClient(addr, port=port)
        self.session = self._client.asteroid.history

    def add(self, item):
        self.session.insert_one(item)
    
    def get_current_song(self):
        return self.session.find(
            { "$query": {}, 
              "$orderby": 
                { 
                    "h_id" : -1 
                } 
            },
            limit=1 
        )
        

    def __del__(self):
        self._client.close()