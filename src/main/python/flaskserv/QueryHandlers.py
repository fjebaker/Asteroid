from src.main.python.flaskserv.Database import MusicDB, UserDB
from flask import jsonify
import abc, json, os

class BaseQuery(metaclass=abc.ABCMeta):
	"""
	Abstract class off of which to construct query classes for the different databases

	Has :meth:`__call__` defined which uses :meth:`__getattribute__` calls on sanitised query string to produce appropriate response.
	The response method should be defined in the inheriting class.

	:param query: the query request
	:type query: byte string
	:returns: json object containing query result
	"""
	def __init__(self, query):
		self.query = query

	def clean_query(self):
		"""
		Sanitises and converts the query passed in constructor to a python string.
		"""
		self.s_query = str(self.query)[3:-1]

	def __call__(self):
		self.clean_query()
		if self.s_query in dir(self):
			res = self.__getattribute__(self.s_query)
		else:
			res = self.defaultCase
		return jsonify(res())

	@abc.abstractmethod
	def defaultCase(self):
		"""
		Must be defined in inheriting class.

		Should return the default case / error case - i.e. if the query does not match to a known query.
		"""
		raise NotImplemented()

class MusicQuery(BaseQuery):
	"""
	Handler for interfacing between music database and the web server.
	Inherits from :class:`BaseQuery`.
	Encapsulates :class:`Database.MusicDB` to make database queries.

	:param query: the query request
	:type query: byte string
	:returns: json object containing query result
	"""

	keys = ["name", "artist", "duration", "file_path", "meta_dat"] #: json keys for parsing database

	def __init__(self, query):
		BaseQuery.__init__(self, query)

	def getAllSongs(self):
		"""
		Fetch from database the whole songs table. Looks in environment variable `MUSIC_DB_PATH` for the database path.
		Converts the list of tuples from database call into a dictionary.

		:returns: dictionary containing the parsed songs table
		"""
		db_result = MusicDB(os.environ["MUSIC_DB_PATH"]).get_all_songs()
		all_songs = []
		for song_tup in db_result:
			song = {}
			for key, value in zip(self.keys, song_tup):
				song[key] = value
			all_songs.append(song)

		return all_songs

	def defaultCase(self):
		"""
		Default case is an empty dictionary.

		:returns: empty dictionary
		"""
		return {}

class UserQuery(BaseQuery):
	"""
	Handler for interfacing between user database and the web server.
	Inherits from :class:`BaseQuery`.
	Encapsulates :class:`Database.UserDB` to make database queries.

	:param query: the query request
	:type query: byte string
	:returns: json object containing query result
	"""

	keys = ["id", "name", "meta_dat"] #: json keys for parsing database

	def __init__(self, query):
		BaseQuery.__init__(self, query)

	def getAllUsers(self):
		"""
		Fetch from database the whole users table. Looks in environment variable `USER_DB_PATH` for the database path.
		Converts the list of tuples from database call into a dictionary.

		:returns: dictionary containing the parsed users table
		"""
		db_result = UserDB(os.environ["USER_DB_PATH"]).get_all_users()
		all_users = []
		for user_tup in db_result:
			user = {}
			for key, value in zip(self.keys, user_tup):
				user[key] = value
			all_users.append(user)

		return all_users


	def defaultCase(self):
		"""
		Default case is an empty dictionary.

		:returns: empty dictionary
		"""
		return {}