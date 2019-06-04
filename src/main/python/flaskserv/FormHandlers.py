from src.main.python.flaskserv.Database import MusicDB, UserDB
from flask import Response
import os

class UserRegister():

	def __init__(self, request):
		self.request = request
		self.form = request.form

	def add_user(self, name):
		udb = UserDB(os.environ["USER_DB_PATH"])
		ids = [i[0] for i in udb.get_column("id")]

		new_id = 0
		if ids != []:
			new_id = max(ids) + 1

		udb.add_user({"id":new_id, "name":name, "hash_pw":0, "meta_dat":""})
		print("added new user with id = {} and name: {}".format(new_id, name))


	def __call__(self):
		#print(dir(self.request))
		print(self.form)
		if "name" in self.form:
			self.add_user(self.form["name"])
			json_s = "{}"
			http_s = 201
		else:
			json_s = "{}"		# todo, error message of what went wrong
			http_s = 404
		return Response(json_s, status=http_s)




