import src.main.python.flaskserv.Database as db
import os, sys

def clear():
	"""
	TODO
	"""
	pass # should delete if db already exists

def build_music():
	"""
	TODO
	"""
	dbinst = db.DBInstance(os.environ["MUSIC_DB_PATH"])
	with dbinst as builder:
		builder.create_table("songs", name="text", artist="text", duration="real", meta_dat="text", file_path="text", UNIQUE="name, artist, file_path")
	db.MusicDB(os.environ["MUSIC_DB_PATH"]).add_song({
				"name":"Test Song",
				"artist":"Test Artist",
				"duration":100,
				"file_path":"./test.wav",
				"meta_dat":""
			})

def build_user():
	"""
	TODO
	"""
	dbinst = db.DBInstance(os.environ["USER_DB_PATH"])
	with dbinst as builder:
		builder.create_table("users", id="long", name="text", hash_pw="long", meta_dat="text")

def build_playlist():
	"""
	TODO
	"""
	dbinst = db.DBInstance(os.environ["PLAYLIST_PATH"])
	with dbinst as builder:
		builder.create_table("playlist", s_id="long", u_id="long", vote="long")

if __name__ == '__main__':
	build_user()
	build_music()
	build_playlist()
