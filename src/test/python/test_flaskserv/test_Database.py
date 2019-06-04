import pytest
import sys
sys.path.append("src/main/python/flaskserv")

import Database

class TestDBInstance():

	def test_memory(self):
		db = Database.DBInstance(":memory:")

	def test_fail_file(self):
		with pytest.raises(Exception) as e:
			db = Database.DBInstance("goblindindi.txt")

	def test_table(self):
		db = Database.DBInstance(":memory:")
		db.create_table("test_table", c1="text", c2="text", c3="real")

		out = db.get_column_info("test_table")
		desire = [(0, 'c1', 'text', 0, None, 0), (1, 'c2', 'text', 0, None, 0), (2, 'c3', 'real', 0, None, 0)]
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

		with pytest.raises(Exception) as e:
			db.get_column_info("__dd_-dd-_--")

	def test_with(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", c1="text", c2="text", c3="real")

	def test_insert_entire(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", c1="text", c2="text", c3="real")
			db.insert_entire_row("test_table", ("test1", "test2", 9))
			db.insert_entire_row("test_table", ("test1.1", "test2.1", 9.1))
			out = db.select_columns("test_table", ["c1", "c3"])
		desire = [('test1', 9.0), ('test1.1', 9.1)]
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)


