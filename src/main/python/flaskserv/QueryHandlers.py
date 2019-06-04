from src.main.python.flaskserv.Database import MusicDB
from flask import jsonify
import abc, json, os

class BaseQuery(metaclass=abc.ABCMeta):
	def __init__(self, query):
		self.query = query

	def clean_query(self):
		self.s_query = str(self.query)[3:-1]

	def __call__(self):
		self.clean_query()
		if self.s_query in dir(self):
			res = self.__getattribute__(self.s_query)
		else:
			res = self.defaultCase
		return jsonify(res())

	@abc.abstractmethod
	def defaultCase():
		raise NotImplemented()

class MusicQuery(BaseQuery):

	keys = ["name", "artist", "duration", "meta_dat"]

	def __init__(self, query):
		BaseQuery.__init__(self, query)

	def getAllSongs(self):
		db_result = MusicDB(os.environ["MUSIC_DB_PATH"]).get_all_songs()
		all_songs = []
		for song_tup in db_result:
			song = {}
			for key, value in zip(self.keys, song_tup):
				song[key] = value
			all_songs.append(song)

		print(all_songs)
		return all_songs

	def defaultCase(self):
		return {}
