import sqlite3

class DBInstance:
	"""
	Provides a specified wrapper for sqlite3 queries

	:param handle: location of sqlite database (can be :memory:)
	:type handle: str
	"""
	def __init__(self, handle):
		try:
			if handle != ":memory:" and ".db" not in handle:
				raise Exception("Not a valid string format.")
			else:
				self.handle = sqlite3.connect(handle)
		except Exception as e:
			raise Exception("Could not connect to handle '{}' : {}".format(handle, str(e)))
			exit(1)
		else:
			self.cursor = self.handle.cursor()

	def __enter__(self):
		return self

	def __exit__(self, *args, **kwargs):
		self._save()
		self.handle.close()
			

	def create_table(self, table_name, **kwargs):
		"""
		Create a new table in the database.
		If \'UNIQUE:col_name\' present in \\*\\*kwargs, adds a CONSTRAINT to the table called unique_col, making col_name unique.

		:param table_name: name of table
		:type table_name: str
		:param \\*\\*kwargs: keys are columns, values are datatypes
		:type \\*\\*kwargs: dict
		"""
		column_type = ""
		constraint = ""
		for c, t in kwargs.items():
			if c == "UNIQUE":
				constraint += ", CONSTRAINT unique_col UNIQUE ({})".format(t)
				continue
			column_type += c + " " + t + ", "
		column_type = column_type[:-2]

		self.cursor.execute('''CREATE TABLE {} ({}{});'''.format(table_name, column_type, constraint))

	def insert_entire_row(self, table_name, data):
		"""
		insert a row of values into a given table

		:param table_name: name of table
		:type table_name: str
		:param data: items are data values
		:type data: list
		:raises: Exception("Bad row format.")
		"""
		column_info = self.get_column_info(table_name)
		column_names = [str(i[1]) for i in column_info]
		if not self._is_row_correct(column_names, data):
			raise Exception("Bad row format.")

		column_repr = ", ".join(column_names)
		data = [str(i) for i in data]
		data_repr = "('" + "', '".join(data) + "')"
		self.handle.execute('''INSERT INTO {} VALUES {};'''.format(table_name, data_repr))

	def select_columns(self, table_name, column_list):
		"""
		select whole column from table

		:param table_name: name of table
		:type table_name: str
		:param column: name of column to select from
		:type column: str/list[str]
		:returns: list of tuples with items from column [(x1, y1, ...), (x2, y2, ...), ...]
		"""
		if type(column_list) != list:
			column_list = [column_list]
		cols = ", ".join(column_list)
		print('''SELECT {} from {}'''.format(cols, table_name))
		return self.handle.execute('''SELECT {} from {}'''.format(cols, table_name)).fetchall()


	def get_column_info(self, table_name):
		"""
		method for getting the column info of a table

		:param table_name: name of the table to get the column names of
		:type table_name: str
		:return: list of column names
		"""
		cursor = self.handle.execute('''PRAGMA table_info({});'''.format(table_name))
		return cursor.fetchall()

	def _save(self):
		"""
		internal method for commiting changes to the database
		"""
		self.handle.commit()

	def _is_row_correct(self, column_names, row):
		"""
		internal method to validate whether a row string matches the table row
		at the moment only checks length of the two arguments is the same, in future will be more thorough

		:param column_names: names of the columns to check against
		:type column_names: list of str
		:param row: names of columns provided by user
		:type row: list of str
		"""
		ok = True
		# TODO
		if len(column_names) != len(row):
			ok = False
		return ok

class DBAccessory(type):
	"""
	Metaclass for the Database classes :class:`MusicDB` and :class:`UserDB`.
	Will wrap all non-special functions with a decorator, providing a scoped instance of :class:`DBInstance`.
	"""
	def __new__(cls, name, bases, local):
		for attr in local:
			value = local[attr]
			if "__" in attr:
				# print("Skipping {}".format(attr))
				continue
			if callable(value):
				local[attr] = DBAccessory.deco(value)
		return type.__new__(cls, name, bases, local)

	@classmethod
	def deco(cls, func):
		"""
		Decorator which calls function with scoped :class:`DBInstance` in the class dict

		:param func: function to decorate
		:type func: function reference
		"""
		def wrapper(*args, **kwargs):
			inst = args[0]						# class instance
			with DBInstance(inst.db_handle) as inst.db_inst:
				result = func(*args, **kwargs)
			return result
		return wrapper

class MusicDB(metaclass=DBAccessory):
	"""
	Provides methods for interacting with the music database.
	Encapsulates :class:`DBInstance`

	Assumes database already has a table with format
		
		songs

		name, artist, duration, meta_dat

	:param db_handle: sqlite database handle
	:type db_handle: str
	"""
	def __init__(self, db_handle):
		self.db_handle = db_handle

	def add_song(self, song_dict):
		# {name:, artist:, duration:, meta_dat:}
		self.db_inst.insert_entire_row("songs", 
			[
				song_dict["name"],
				song_dict["artist"],
				song_dict["duration"],
				song_dict["meta_dat"]
			])

	def get_song_by_name(self, name):
		pass

	def get_song_by_artist(self, artist):
		pass

	def get_all_songs(self):
		"""
		Returns all songs in songs table of database given in constructor
		"""
		return self.db_inst.select_columns("songs",
			["name", "artist", "duration", "meta_dat"])


class UserDB(metaclass=DBAccessory):
	"""
	Provides methods for interacting with the static user database.
	Encapsulates :class:`DBInstance`

	Assumes database already has a table with format
		
		users

		id, name, hash_pw, meta_dat

	:param db_handle: sqlite database handle
	:type db_handle: str
	"""
	def __init__(self, path):
		self.db_handle = "HELLO WORLD"

	def add_user(self, user_dict):
		# {id, name, hash_pw, meta_dat}
		pass

	def get_user_by_id(self, id):
		pass

	def get_user_by_name(self, name):
		pass

	def get_all_users(self, name):
		pass

if __name__ == '__main__':
	#with DBInstance("test.db") as db:
	#	db.create_table("songs", name="text", artist="text", duration="real", meta_dat="text", UNIQUE='name, artist')
#	with DBInstance("test.db") as db:
		#db.create_table("songs", name="text", artist="text", duration="real", meta_dat="text")
	#with DBInstance("test.db") as db:
#		print(db.get_column_info("songs"))
#	with DBInstance("test.db") as db:
		#db.create_table("test_table", c1="text", c2="text", c3="real")
#	with DBInstance("test.db") as db:
#		print(db.get_column_info("test_tabl"))
	mdb = MusicDB("test.db")
#	mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "meta_dat":""})
#	print(mdb.get_all_songs())
#	mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "meta_dat":""})
#	mdb.add_song({"name":"Plastic Boogie", "artist":"King Gizzard and the Lizard Wizard", "duration":181, "meta_dat":""})
#	mdb.add_song({"name":"Fishing For Fishies", "artist":"King Gizzard and the Lizard Wizard", "duration":298, "meta_dat":""})
	print(mdb.get_all_songs())
