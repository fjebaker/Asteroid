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

		:param table_name: name of table
		:type table_name: str
		:param \\*\\*kwargs: keys are columns, values are datatypes
		:type \\*\\*kwargs: dict
		"""
		column_type = ""
		for c, t in kwargs.items():
			column_type += c + " " + t + ", "
		column_type = column_type[:-2]
		self.cursor.execute('''CREATE TABLE {} ({});'''.format(table_name, column_type))

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
		:type column: str
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

if __name__ == '__main__':
	d = DBInstance(":memory:")
	d.create_table("test_table", c1="text", c2="text", c3="real")
	#print(d.get_column_info("test_table"))
	d.insert_entire_row("test_table", ("test1", "test2", 9))
	d.insert_entire_row("test_table", ("test1.1", "test2.1", 9.1))
	print(d.select_columns("test_table", ["c1", "c3"]))

