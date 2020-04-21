import os
import exiftool
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError

def check_database_connection(app):
    client = MongoClient(app.config['MONGO_URI'],
        serverSelectionTimeoutMS=app.config['MONGO_SERVER_SELECTION_TIMEOUT_MS'])
    try:
        client.server_info()
    except ServerSelectionTimeoutError:
        print("FAULTY DATABASE CONNECTION")
        exit(1)

def _config_database(db):
    """ for ease of testing, seperated these steps """
    # musicdb
    db.songs.create_index('file_path', unique=True)
    db.songs.create_index('s_id', unique=True)

    # usersdb
    db.users.create_index('name', unique=True)
    db.users.create_index('u_id', unique=True)

    # playlistdb
    db.queue.create_index('s_id', unique=True)

    # history_item
    db.history.create_index('h_id', unique=True)

def configure_database(app):
    client = MongoClient(app.config['MONGO_URI'])
    db = client.asteroid
    _config_database(db)


def clear(app, songs=True, users=True, playlist=True):
    """ deletes the database """
    client = MongoClient(app.config['MONGO_URI'])
    db = client.asteroid
    if songs: db.songs.delete_many({})
    if users: db.users.delete_many({})
    if playlist: db.playlist.delete_many({})


def get_song_item(song_path):
    with exiftool.ExifTool() as et:
        metadata = et.get_metadata(song_path)

    #print(metadata)
    artist = metadata["ID3:Artist"]
    title = metadata["ID3:Title"]
    duration = metadata["Composite:Duration"]

    return {'name': title, 'artist': artist, 'duration': duration, 'file_path': song_path, 'meta_dat': ''}


def list_wav(path):
    files = [os.path.join(path, f) for f in os.listdir(
        path) if os.path.isfile(os.path.join(path, f)) and '.mp3' in f]
    return files


def build_music(folder_location, app):
    client = MongoClient(app.config['MONGO_URI'])
    db = client.asteroid

    if folder_location == None:
        return
    try:
        s_id = db.songs.find({}).sort('s_id', -1).next()
        s_id = s_id.get('s_id') + 1
    except StopIteration:
        s_id = 1

    for file in list_wav(folder_location):
        try:
            song = {'s_id': s_id, **get_song_item(file)}
            db.songs.insert_one(song)
        except Exception as e:  # TODO, song doesn't exist if fails
            print("[!] trying to add song '{}', raised exception: \n\t\t'{}'".format(song['name'], str(e)))
        else:
            s_id += 1
            print("[+] added '{}' by '{}' @ '{}' to database".format(song['name'], song['artist'], song['file_path']))
