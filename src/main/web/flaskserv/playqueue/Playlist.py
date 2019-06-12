from src.main.web.flaskserv.Database import DBAccessory


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

	keys = ("s_id", "u_id", "vote")
	k_type = ("long", "long", "long")

	def __init__(self, db_handle):
		self.db_handle = db_handle

	def create_table(self):
		"""
		TODO
		"""
		self.db_inst.create_table("playlist", self.k_type, additional=", CONSTRAINT s_id_unique UNIQUE (s_id)")

	def add(self, item):
		"""
		TODO

		:param item:
		:return:
		"""
		self.db_inst.insert_entire_row("playlist", item)

	def update_vote(self, s_id, vote):
		"""
		updates the entry in playlist table for a given song id, adding vote to the exisiting vote value

		:param s_id: song id to remove from playlist
		:type s_id: int
		:param vote: vote value to change by (can be positive or negative)
		:type vote: int
		"""
		# print("DEBUG -- in update_vote, params are ", s_id, vote)
		c_vote = self.db_inst.select_rows("playlist", ("vote",), {1:s_id})[0]["vote"]
		self.db_inst.update_generic("playlist", 
				{3:int(c_vote)+int(vote)},
				{1:s_id}
			)

	def get_most_voted(self):
		"""
		TODO
		"""
		most_voted_song = self.db_inst.select_rows("playlist", ("*",), {0:""}, like=True, orderlimit="ORDER BY vote DESC LIMIT 1")
		return most_voted_song

	def remove(self, s_id):
		"""
		removes the row containing song id ``s_id`` from the database

		:param s_id: song id to remove from playlist
		:type s_id: int
		"""
		self.db_inst.delete_rows("playlist", {1:s_id})

	def get_playlist(self):
		"""
		returns the playlist table from the database given to constructor
		has structure

			song_id, user_requested_id, vote_values
		
		:returns: list[int, int, int]
		"""
		db_result = self.db_inst.get_all_rows("playlist")
		return self._remove_rowid(db_result)

	def _remove_rowid(self, db_result):
		for item in db_result:
			del item["rowid"]
		return db_result