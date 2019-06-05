from flask import Response
from src.main.python.flaskserv.model.Playlist import Playlist
import os, json

class Vote:
	"""
	TODO
	"""
	def __init__(self, request):
		self.request = request
		self.form = request.form

	def handle_vote(self, s_id, u_id, vote):
		"""
		TODO
		"""

		pl = Playlist(os.environ["PLAYLIST_PATH"])
		playlist = pl.get_playlist()

		# check if already exists in database
		exists = False
		for item in playlist:
			if int(s_id) == int(item[0]):
				exists = True

		if exists:
			pl.update_vote(s_id, vote)
			return Response(
					json.dumps({"message":"updated vote"}), 
					status=200
				)
		else:
			pl.add(self.form)
			return Response(
					json.dumps({"message":"added entry into playlist"}), 
					status=201
				)

	def pop_playlist(self, pop, token):
		"""
		TODO
		"""

		# todo: token checks

		pl = Playlist(os.environ["PLAYLIST_PATH"])
		playlist = pl.get_playlist()
		if playlist == []:
			return Response(
					'{}',
					status=403
				)

		most_voted_song = sorted(playlist, key=lambda x: int(x[2]))[-1]		
		pl.remove(most_voted_song[0])
		return Response(
				json.dumps(most_voted_song),
				status=200
			)

	def __call__(self):
		if self.request.__dict__["environ"]["REQUEST_METHOD"] == 'GET':
			return Response(
					json.dumps(Playlist(os.environ["PLAYLIST_PATH"]).get_playlist()),
					status=200
				)

		if "s_id" in self.form and "u_id" in self.form and "vote" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
			return self.handle_vote(self.form['s_id'], self.form["u_id"], self.form["vote"])

		if "pop" in self.form and "token" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
			return self.pop_playlist(self.form["pop"], self.form["token"])

		return Response(json.dumps({"message":"no voting operation interpreted from request"}), status=400) 