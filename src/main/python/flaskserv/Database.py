import sqlite3
import functools

def sanatise_string(func):
	@functools.wraps(func)
	def _sanatise(cls, arg):
		arg = arg.replace("'", "''").replace('"', '""')
		return func(cls, arg)
	return _sanatise

def sanatise_dict(keys):
	def _wrapper(func):
		@functools.wraps(func)
		def _sanatise(cls, arg):
			for i in keys:
				arg[i] = arg[i].replace("'", "''").replace('"', '""')
			return func(cls, arg)
		return _sanatise
	return _wrapper


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
		else:
			self.cursor = self.handle.cursor()

	def __enter__(self):
		return self

	def __exit__(self, *args, **kwargs):
		self._save()
		self.handle.close()
			

	def create_table(self, table_name, keys, types):
		"""
		TODO
		"""
		column_type = ""
		constraint = ""
		for c, t in zip(keys, types):
			if c == "UNIQUE":
				constraint += ", CONSTRAINT unique_col UNIQUE ({})".format(t)
				continue
			column_type += c + " " + t + ", "
		column_type = column_type[:-2]

		self.cursor.execute('''CREATE TABLE %s (%s%s);''' % (table_name, column_type, constraint))

	def insert_entire_row(self, table_name, data):
		"""
		insert a row of values into a given table

		:param table_name: name of table
		:type table_name: str
		:param data: items are data values
		:type data: tuple
		:raises: Exception("Bad row format.")
		"""
		# print("DEBUG -- insert_entire_row : ", table_name, data)
		column_names = self.get_column_info(table_name)
		if not self._is_row_correct(column_names, data):
			raise Exception("Bad row format.")

		column_repr = ", ".join(column_names)
		data = [str(i) for i in data]
		data_repr = "('" + "', '".join(data) + "')"
		self.handle.execute('''INSERT INTO %s VALUES %s;''' % (table_name, data_repr))

	def select_rows(self, table_name, condition, substring=False):
		"""
		select rows from table which meat condition

		:param table_name: name of table
		:type table_name: str
		:param condition: the condition to be met to qualify for selection
		:type condition: dict
		"""
		condition = list(condition.items())[0]
		if not substring:
			condition_string = str(condition[0]) + " = '" + str(condition[1]) + "'"
		else:
			condition_string = str(condition[0]) + " LIKE '%" + str(condition[1]) + "%'"

		return tuple(self.handle.execute('''SELECT * FROM %s WHERE %s ORDER BY rowid ASC;''' % (table_name, condition_string)).fetchall())
	

	def select_columns(self, table_name, column_list):
		"""
		select whole column from table

		:param table_name: name of table
		:type table_name: str
		:param column: name of column to select from
		:type column: str/tuple[str]
		:returns: tuple of tuples with items from column [(x1, y1, ...), (x2, y2, ...), ...]
		"""
		if type(column_list) != tuple:
			column_list = (column_list,)
		cols = ", ".join(column_list)
		# print('''SELECT {} from {}'''.format(cols, table_name))
		return tuple(self.handle.execute('''SELECT %s FROM %s ORDER BY rowid ASC;''' % (cols, table_name)).fetchall())

	def get_n_latest_items(self, table_name, n):
		"""
		TODO
		"""
		return tuple(self.handle.execute('''SELECT * FROM %s ORDER BY rowid DESC LIMIT %s''' % (table_name, n)))


	def update_generic(self, table_name, changes, condition):
		"""
		update entries according to condition in the database

		:param table_name: name of the table to update
		:type table_name: str
		:param changes: changes to enact e.g. `{col1:value1, ...}`
		:type changes: dict
		:param condition: the condition to be met to qualify for changes e.g. `{col3:value3}`
		:type condition: dict

		TODO check the changes fit the table
		"""

		changes_string = ""
		condition_string = ""

		for i, j in changes.items():
			changes_string += str(i) + " = '" + str(j) + "', "
		changes_string = changes_string[:-2]

		condition = list(condition.items())[0]
		condition_string = str(condition[0]) + " = '" + str(condition[1]) + "'"

		print('''UPDATE %s SET %s WHERE %s''' % (table_name, changes_string, condition_string))
		self.handle.execute('''UPDATE %s SET %s WHERE %s''' % (table_name, changes_string, condition_string))

	def delete_rows(self, table_name, condition):
		"""
		delete rows from a table in database if condition is met

		:param table_name: name of table
		:type table_name: str
		:param condition: the condition to be met to qualify for removal
		:type condition: dict		
		"""
		condition = tuple(list(condition.items()))[0]
		condition_string = str(condition[0]) + " = '" + str(condition[1]) + "'"
		# print("DEBUG -- in delete_rows making query: " + '''DELETE FROM {} WHERE {}'''.format(table_name, condition_string))
		self.handle.execute('''DELETE FROM %s WHERE %s''' % (table_name, condition_string))

	def get_column_info(self, table_name):
		"""
		method for getting the column info of a table

		:param table_name: name of the table to get the column names of
		:type table_name: str
		:return: tuple of column names
		"""
		cursor = self.handle.execute('''PRAGMA table_info(%s);''' % (table_name,))
		cols = sorted(cursor.fetchall(), key=lambda x: int(x[0]))
		return tuple([i[1] for i in cols])

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
		:type column_names: tuple of str
		:param row: names of columns provided by user
		:type row: tuple of str
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

		name, artist, duration, path, meta_dat

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
				song_dict["file_path"],
				song_dict["meta_dat"]
			])

	@sanatise_string
	def get_songs_by_name(self, name):
		"""
		TODO
		"""
		return self.db_inst.select_rows("songs", {"name":name}, substring=True)

	def get_by_rowid(self, rowid):
		"""
		Get song by id.

		:param int rowid: database table ``rowid`` to return whole row from.
		:returns: song with ``rowid``
		:rtype: length 1 tuple of tuple
		"""
		return self.db_inst.select_rows("songs", {"rowid":rowid})

	@sanatise_string
	def get_songs_by_artist(self, artist):
		"""
		TODO
		"""
		return self.db_inst.select_rows("songs", {"artist":artist}, substring=True)

	def get_all_songs(self):
		"""
		Returns all songs in database given in constructor.

		:returns: all rows of ``songs`` table in database.
		:rtype: tuple of tuples
		"""
		return self.db_inst.select_columns("songs",
			("name", "artist", "duration", "file_path", "meta_dat"))


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
	def __init__(self, db_handle):
		self.db_handle = db_handle

	@sanatise_dict(['name'])
	def add_user(self, user_dict):
		# {id, name, hash_pw, meta_dat}
		self.db_inst.insert_entire_row("users", 
			[
				user_dict["id"],
				user_dict["name"],
				user_dict["hash_pw"],
				user_dict["meta_dat"],
			])

	def get_user_by_id(self, id_n):
		"""
		Get user by id.

		:param int id_n: ``users`` table column ``id`` to match and return whole row from.
		:returns: user with ``id==id_n``
		:rtype: length 1 tuple of tuple
		"""
		return self.db_inst.select_rows("users", {"id":id_n})

	@sanatise_string	
	def get_user_by_name(self, name):
		"""
		TODO
		"""
		pass

	def get_column(self, column_name):
		"""
		Return the selected column from users table

		:param column_name: name of column to retrieve
		:type column_name: str
		:returns: tuple of tuples representing column
		"""
		return self.db_inst.select_columns("users", column_name)

	def get_all_users(self):
		"""
		Returns all users in database given in constructor.

		:returns: all rows of ``users`` table in database.
		:rtype: tuple of tuples
		"""
		return self.db_inst.select_columns("users",
			("id", "name", "meta_dat"))

if __name__ == '__main__':
	pass
