from src.main.web.flaskserv.Database import DBAccessory

class History(metaclass=DBAccessory):
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
		self.db_inst.create_table("history", self.k_type)

	def add(self, item):
		"""
		TODO

		:param item:
		:return:
		"""
		self.db_inst.insert_entire_row("history", item)

	def get_current_song(self):
		"""
		TODO
		"""
		return self._remove_rowid(self.db_inst.get_n_latest_rows("history", 1))

	def _remove_rowid(self, db_result):
		for item in db_result:
			del item["rowid"]
		return db_result
