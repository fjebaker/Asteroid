from src.main.python.flaskserv.Database import MusicDB, UserDB
from flask import Response
import os

class UserHandler():
	"""
	Handles different requests related to user database.

	:param request: flask request object
	:type request: flask request
	"""

	def __init__(self, request):
		self.request = request
		self.form = request.form

	def add_user(self, name):
		"""
		add user method, which adds the new user to the database. Encapsulates :class:`Database.UserDB` to add new user with max(id) + 1 as id.

		:param name: name of new user to add to database
		:type name: str
		"""
		udb = UserDB(os.environ["USER_DB_PATH"])
		ids = [i[0] for i in udb.get_column("id")]

		new_id = 0	# TODO: future, make the database auto increment
		if ids != []:
			new_id = max(ids) + 1

		udb.add_user({"id":new_id, "name":name, "hash_pw":0, "meta_dat":""})

	def __call__(self):
		if "name" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
			self.add_user(self.form["name"])
			json_s = "{}"
			http_s = 201
		else:
			json_s = "{}"		# todo, error message of what went wrong
			http_s = 404
		return Response(json_s, status=http_s)




