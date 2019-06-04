import pytest
import sys, os
sys.path.append("src/main/python/flaskserv")

import Database

@pytest.fixture(scope="session")
def temp_db(tmpdir_factory):
    fn = tmpdir_factory.mktemp("data").join("test.db")
    yield str(fn)

@pytest.fixture(scope="class")
def MDB_inst(request, tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("test.db"))

	with Database.DBInstance(fn) as db:
		db.create_table("songs", name="text", artist="text", duration="real", meta_dat="text", UNIQUE='name, artist')
	mdb = Database.MusicDB(fn)
	request.cls.mdb = mdb
	yield
	del mdb


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

	def test_persitance(self, temp_db):
		with Database.DBInstance(temp_db) as db:
			db.create_table("test_table", c1="text", c2="text", c3="real")
		with Database.DBInstance(temp_db) as db:
			assert db.get_column_info("test_tabl") == []
			assert db.get_column_info("test_table") != []

	def test_unique(self):
		with Database.DBInstance(":memory:") as db:
			db.create_table("test_table", c1="text", c2="text", UNIQUE="c1")


@pytest.mark.usefixtures('MDB_inst')
class TestMusicDB():

	def test_song_adding(self):
		self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "meta_dat":""})
		with pytest.raises(Exception) as e:	# test to make sure unique condition holds
			self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":333, "meta_dat":""})
			self.mdb.add_song({"name":"You Too Must Die", "artist":"GOLD", "duration":124, "meta_dat":""})
		self.mdb.add_song({"name":"Plastic Boogie", "artist":"King Gizzard and the Lizard Wizard", "duration":181, "meta_dat":""})
		self.mdb.add_song({"name":"Fishing For Fishies", "artist":"King Gizzard and the Lizard Wizard", "duration":298, "meta_dat":""})

	def test_song_fetch_all(self):
		desire = [('You Too Must Die', 'GOLD', 333.0, ''), ('Plastic Boogie', 'King Gizzard and the Lizard Wizard', 181.0, ''), ('Fishing For Fishies', 'King Gizzard and the Lizard Wizard', 298.0, '')]
		out = self.mdb.get_all_songs()
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)




