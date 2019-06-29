from src.main.web.flaskserv import Playlist, MusicDB, UserDB, History
import os
from src.main.databasebuilder.setupfuncs import music_db_path, user_db_path, playlist_db_path
import exiftool


def clear(path):
    """
    TODO
    """
    if os.path.isfile(path):
        os.remove(path)


def get_song_item(song_path):
    """
    TODO
    """
    with exiftool.ExifTool() as et:
        metadata = et.get_metadata(song_path)

    artist = metadata["RIFF:Artist"]
    title = metadata["RIFF:Title"]
    duration = metadata["Composite:Duration"]

    return (title, artist, duration, song_path, "")


def list_wav(path):
    """
    TODO
    """
    files = [os.path.join(path, f) for f in os.listdir(
        path) if os.path.isfile(os.path.join(path, f)) and '.wav' in f]
    return files


def build_music(folder_location):
    """
    TODO
    """
    dbinst = MusicDB(music_db_path())
    try:
        dbinst.create_table()
    except Exception as e:
        print("[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(music_db_path(), str(e)))

    if folder_location == None:
        return

    for file in list_wav(folder_location):
        try:
            song = get_song_item(file)
            dbinst.add_song(song)
        except Exception as e:  # TODO, song doesn't exist if fails
            print("[!] trying to add song '{}', raised exception: \n\t\t'{}'".format(song[3], str(e)))
        else:
            print("[+] added '{}' by '{}' @ '{}' to database".format(song[0], song[1], song[3]))


def build_user():
    """
    TODO
    """
    dbinst = UserDB(user_db_path())
    try:
        dbinst.create_table()
    except Exception as e:
        print("[!] trying to create table 'users' in {}, raised exception: \n\t\t'{}'".format(user_db_path(), str(e)))


def build_playlist():
    """
    TODO
    """
    dbinst = Playlist(playlist_db_path())
    try:
        dbinst.create_table()
    except Exception as e:
        print(
            "[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(playlist_db_path(), str(e)))

    dbinst = History(playlist_db_path())
    try:
        dbinst.create_table()
    except Exception as e:
        print("[!] trying to create table 'history' in {}, raised exception: \n\t\t'{}'".format(playlist_db_path(), str(e)))
