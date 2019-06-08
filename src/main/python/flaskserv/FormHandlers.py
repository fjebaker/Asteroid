from src.main.python.flaskserv.Database import MusicDB, UserDB
from flask import Response
import os, json

class UserHandler():
	"""
	Handles different requests related to user database.

	:param request: :class:`flask:Request` instance containing the registration ``POST``.
	:returns: :class:`flask:Response` with json string and status

	``status 404`` - error, with error message in json

	``status 201`` - success, with saved username in json
	"""

	def __init__(self, request):
		self.request = request
		self.form = request.form

	def add_user(self, name):
		"""
		add user method, which adds the new user to the database. Encapsulates :class:`src.main.python.flaskserv.Database.UserDB` to add new user with max(id) + 1 as id.
		Starting id is 1.

		:param name: name of new user to add to database
		:type name: str
		"""
		udb = UserDB(os.environ["USER_DB_PATH"])
		ids = [int(i[0]) for i in udb.get_column("id")]

		print("DEBUG -- ids:", ids)
		new_id = 1	# TODO: future, make the database auto increment
		if ids != []:
			new_id = max(ids) + 1

		udb.add_user({"id":new_id, "name":name, "hash_pw":0, "meta_dat":""})
		return new_id

	def __call__(self):
		if "name" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
			new_id = self.add_user(self.form["name"])
			json_s = {"id":new_id}
			http_s = 201
		else:
			json_s = {}				# todo, error message of what went wrong
			http_s = 400
		return Response(json.dumps(json_s), status=http_s, mimetype='application/json')




