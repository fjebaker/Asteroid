import pytest
from src.main.web.flaskserv.Database import UserDB

@pytest.fixture(scope="module")
def atempdir(tmpdir_factory):
	fn = tmpdir_factory.mktemp("temp").join("users.db")
	yield str(fn)

@pytest.fixture(scope="class")
def tempdb(request, tmpdir_factory, atempdir):
	db = UserDB(atempdir)
	db.create_table()
	request.cls.db = db
	yield
	del db

def test_init():
	UserDB(":memory:")

def test_table_creation():
	UserDB(":memory:").create_table()

@pytest.mark.usefixtures("tempdb")
class TestUDB:
	def test_add_user(self):
		self.db.add_user((1, "user1", 101, "data1"))
		self.db.add_user((2, "user2", 102, "data2"))
		assert self.db.get_all_users() == ({'rowid': 1, 'id': 1, 'name': 'user1', 'hash_pw': 101, 'meta_dat': 'data1'}, {'rowid': 2, 'id': 2, 'name': 'user2', 'hash_pw': 102, 'meta_dat': 'data2'})

	def test_unique(self):
		with pytest.raises(Exception):
			self.db.add_user((2, "user3", 103, "data3"))

	def test_get_by_id(self):
		assert self.db.get_by_id(2) == ({'id': 2, 'name': 'user2', 'hash_pw': 102, 'meta_dat': 'data2'},)

