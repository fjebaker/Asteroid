from src.main.python.flaskserv.Database import DBAccessory
import os

class Playlist(metaclass=DBAccessory):
	"""
	TODO
	"""

	def __init__(self, db_handle):
		self.db_handle = db_handle

	def add(self, item):
		"""
		TODO
		"""
		self.db_inst.insert_entire_row("playlist",
			[
				item["s_id"],
				item["u_id"],
				item["vote"],
			])

	def update_vote(self, s_id, vote):
		"""
		TODO
		"""
		c_vote = self.db_inst.select_rows("playlist", {"s_id":s_id})[0][2]
		self.db_inst.update_generic("playlist", 
				{"vote":c_vote+vote},
				{"s_id":s_id}
			)

	def remove(self, s_id):
		"""
		TODO
		"""
		self.db_inst.delete_rows("playlist", {"s_id":s_id})

	def get_playlist(self):
		"""
		TODO
		"""
		return self.db_inst.select_columns("playlist", "*")