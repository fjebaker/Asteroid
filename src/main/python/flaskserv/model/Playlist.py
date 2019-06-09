from src.main.python.flaskserv.Database import DBAccessory
import os

class Playlist(metaclass=DBAccessory):
	"""
	Class for accessing the playlist database.
	Has metaclass :class:`src.main.python.flaskserv.Database.DBAccessory`.
	Requires a table in format

		playlist

		s_id (long), u_id (long), vote (long)


	:param db_handle: database handle in which playlist table exists
	:type db_handle: str
	"""

	def __init__(self, db_handle):
		self.db_handle = db_handle

	def add(self, item):
		"""
		add a new entry to the playlist table

		:param item: song item, in format {s_id, u_id, vote}
		:type item: dict
		"""
		self.db_inst.insert_entire_row("playlist",
			[
				item["s_id"],
				item["u_id"],
				item["vote"],
			])

	def update_vote(self, s_id, vote):
		"""
		updates the entry in playlist table for a given song id, adding vote to the exisiting vote value

		:param s_id: song id to remove from playlist
		:type s_id: int
		:param vote: vote value to change by (can be positive or negative)
		:type vote: int
		"""
		# print("DEBUG -- in update_vote, params are ", s_id, vote)
		c_vote = self.db_inst.select_rows("playlist", {"s_id":s_id})[0][2]
		self.db_inst.update_generic("playlist", 
				{"vote":int(c_vote)+int(vote)},
				{"s_id":s_id}
			)

	def get_most_voted(self):
		"""
		TODO
		"""
		playlist = self.db_inst.select_columns("playlist", "*")		# can't call own functions
		# print("DEBUG -- get_most_voted :: before return None")
		if playlist == ():
			return None
		most_voted_song = max(playlist, key=lambda x: int(x[2]))

		self.db_inst.delete_rows("playlist", {"s_id":most_voted_song[0]})		# can't call own functions
		# print("DEBUG -- get_most_voted")
		self.db_inst.insert_entire_row("history", most_voted_song)
		return most_voted_song

	def get_current_song(self):
		"""
		TODO
		"""
		history = self.db_inst.get_n_latest_items('history', 1)
		# print("DEBUG -- get_current_song :: ", history)
		if history == ():
			return []
		return history[-1]
	

	def remove(self, s_id):
		"""
		removes the row containing song id ``s_id`` from the database

		:param s_id: song id to remove from playlist
		:type s_id: int
		"""
		self.db_inst.delete_rows("playlist", {"s_id":s_id})

	def get_playlist(self):
		"""
		returns the playlist table from the database given to constructor
		has structure

			song_id, user_requested_id, vote_values
		
		:returns: list[int, int, int]
		"""
		return self.db_inst.select_columns("playlist", "*")