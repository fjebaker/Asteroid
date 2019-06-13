import pytest
from src.main.web.flaskserv.Database import MusicDB

@pytest.fixture(scope="module")
def atempdir(tmpdir_factory):
	fn = tmpdir_factory.mktemp("temp").join("music.db")
	yield str(fn)

@pytest.fixture(scope="class")
def tempdb(request, tmpdir_factory, atempdir):
	db = MusicDB(atempdir)
	try:
		db.create_table()
	except:
		print("MUSICDB TEST TABLE ALREADY EXISTS")
	request.cls.db = db
	yield
	del db

def test_init():
	MusicDB(":memory:")

def test_table_creation():
	MusicDB(":memory:").create_table()

@pytest.mark.usefixtures("tempdb")
class TestMDB:
	def test_adding_song(self):
		self.db.add_song(("name1", "artist1", 1, "path1", "meta1"))
		self.db.add_song(("name2", "artist2", 2, "path2", "meta2"))
		self.db.add_song(("name3", "artist3", 3, "path3", "meta3"))
		res = self.db.get_all_songs()
		assert res == ({'rowid': 1, 'name': 'name1', 'artist': 'artist1', 'duration': 1.0, 'file_path': 'path1', 'meta_dat': 'meta1'}, {'rowid': 2, 'name': 'name2', 'artist': 'artist2', 'duration': 2.0, 'file_path': 'path2', 'meta_dat': 'meta2'}, {'rowid': 3, 'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3'})

	def test_get_by_id(self):
		assert self.db.get_by_rowid(3) == ({'rowid': 3, 'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3'},)
		assert self.db.get_by_rowid(2) == ({'rowid': 2, 'name': 'name2', 'artist': 'artist2', 'duration': 2.0, 'file_path': 'path2', 'meta_dat': 'meta2'},)

	def test_get_by_name(self):
		assert self.db.get_by_name("3") == ({'rowid': 3, 'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3'},)
		assert self.db.get_by_name("ame2") == ({'rowid': 2, 'name': 'name2', 'artist': 'artist2', 'duration': 2.0, 'file_path': 'path2', 'meta_dat': 'meta2'},)

	def test_get_by_artist(self):
		assert self.db.get_by_artist("3") == ({'rowid': 3, 'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3'},)
		assert self.db.get_by_artist("ist") == ({'name': 'name1', 'artist': 'artist1', 'duration': 1.0, 'file_path': 'path1', 'meta_dat': 'meta1', 'rowid': 1}, {'name': 'name2', 'artist': 'artist2', 'duration': 2.0, 'file_path': 'path2', 'meta_dat': 'meta2', 'rowid': 2}, {'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3', 'rowid': 3})

	def test_get_page(self):
		assert self.db.get_page() == ({'rowid': 3, 'name': 'name3', 'artist': 'artist3', 'duration': 3.0, 'file_path': 'path3', 'meta_dat': 'meta3'}, {'rowid': 2, 'name': 'name2', 'artist': 'artist2', 'duration': 2.0, 'file_path': 'path2', 'meta_dat': 'meta2'}, {'rowid': 1, 'name': 'name1', 'artist': 'artist1', 'duration': 1.0, 'file_path': 'path1', 'meta_dat': 'meta1'})

	def test_unique(self):
		with pytest.raises(Exception):
			self.db.add_user(("name4", "artist4", 4, "path1", "meta4"))
