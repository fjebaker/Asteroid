<<<<<<< HEAD:src/main/databasebuilder/SetupBuild.py
import src.main.web.flaskserv.Database as db
=======
from src.main.web.flaskserv import Playlist, MusicDB, UserDB, History
>>>>>>> 2fbb391db5efdb0962cdc1705f400027ec95afdf:src/main/databasebuilder/SetupBuild.py
import os
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
	files = [os.path.join(path, f) for f in os.listdir(path) if os.path.isfile(os.path.join(path, f)) and '.wav' in f]
	return files

def build_music(folder_location):
	"""
	TODO
	"""
	dbinst = MusicDB(os.environ["MUSIC_DB_PATH"])
	try:
<<<<<<< HEAD:src/main/databasebuilder/SetupBuild.py
		with dbinst as builder:
			builder.create_table("songs", 
				("name", "artist", "duration", "file_path", "meta_dat", "UNIQUE"),
				("text", "text", "real", "text", "text", "file_path")
			)
=======
		dbinst.create_table()
>>>>>>> 2fbb391db5efdb0962cdc1705f400027ec95afdf:src/main/databasebuilder/SetupBuild.py
	except Exception as e:
		print("[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(os.environ["MUSIC_DB_PATH"], str(e)))

	if folder_location == None:
		return

	for file in list_wav(folder_location):
		# print("NOW ON FILE -- ", file)
		try:
			song = get_song_item(file)
			dbinst.add_song(song)
		except Exception as e:	# TODO, song doesn't exist if fails
			print("[!] trying to add song '{}', raised exception: \n\t\t'{}'".format(song[3], str(e)))
		else:
			print("[+] added '{}' by '{}' @ '{}' to database".format(song[0], song[1], song[3]))


def build_user():
	"""
	TODO
	"""
	dbinst = UserDB(os.environ["USER_DB_PATH"])
	try:
		dbinst.create_table()
	except Exception as e:
		print("[!] trying to create table 'users' in {}, raised exception: \n\t\t'{}'".format(os.environ["USER_DB_PATH"], str(e)))

def build_playlist():
	"""
	TODO
	"""
	dbinst = Playlist(os.environ["PLAYLIST_PATH"])
	try:
		dbinst.create_table()
	except Exception as e:
			print("[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(os.environ["PLAYLIST_PATH"], str(e)))

	dbinst = History(os.environ["PLAYLIST_PATH"])
	try:
		dbinst.create_table()
	except Exception as e:
			print("[!] trying to create table 'history' in {}, raised exception: \n\t\t'{}'".format(os.environ["PLAYLIST_PATH"], str(e)))
