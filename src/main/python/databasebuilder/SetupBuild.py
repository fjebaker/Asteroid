import src.main.python.flaskserv.Database as db
import os, sys
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

	return {
		"name":title,
		"artist":artist,
		"duration":duration,
		"file_path":song_path,
		"meta_dat":""
		}


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
	dbinst = db.DBInstance(os.environ["MUSIC_DB_PATH"])
	try:
		with dbinst as builder:
			builder.create_table("songs", name="text", artist="text", duration="real", meta_dat="text", file_path="text", UNIQUE="name, artist, file_path")
	except Exception as e:
			print("[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(os.environ["MUSIC_DB_PATH"], str(e)))

	if folder_location == None:
		return

	for file in list_wav(folder_location):
		try:
			song = get_song_item(file)
			db.MusicDB(os.environ["MUSIC_DB_PATH"]).add_song(song)
		except Exception as e:
			print("[!] trying to add song '{}', raised exception: \n\t\t'{}'".format(song['file_path'], str(e)))
		else:
			print("[+] added '{}' by '{}' @ '{}' to database".format(song['name'], song['artist'], song['file_path']))


def build_user():
	"""
	TODO
	"""
	dbinst = db.DBInstance(os.environ["USER_DB_PATH"])
	try:
		with dbinst as builder:
			builder.create_table("users", id="long", name="text", hash_pw="long", meta_dat="text")
	except Exception as e:
		print("[!] trying to create table 'users' in {}, raised exception: \n\t\t'{}'".format(os.environ["USER_DB_PATH"], str(e)))

def build_playlist():
	"""
	TODO
	"""
	dbinst = db.DBInstance(os.environ["PLAYLIST_PATH"])
	try:
		with dbinst as builder:
			builder.create_table("playlist", s_id="long", u_id="long", vote="long")
	except Exception as e:
			print("[!] trying to create table 'playlist' in {}, raised exception: \n\t\t'{}'".format(os.environ["PLAYLIST_PATH"], str(e)))
