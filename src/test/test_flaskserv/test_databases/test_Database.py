import pytest
from src.main.web.flaskserv.Database import DBInstance


@pytest.fixture(scope="module")
def atempdir(tmpdir_factory):
    fn = tmpdir_factory.mktemp("temp").join("data.db")
    yield str(fn)


@pytest.fixture(scope="class")
def tempdb(request, tmpdir_factory, atempdir):
    musickeys = ("name", "artist", "duration", "file_path", "meta_dat")
    db = DBInstance(atempdir)
    with db(musickeys):
        db.create_table("songs",
                        ("text", "text", "real", "text", "text")
                        )
    request.cls.keys = musickeys
    request.cls.db = db
    yield
    del db


def test_enter_exit(atempdir):
    # test no errors thrown with sunny day
    db = DBInstance(":memory:")
    with db:
        pass

    # ensure .db type work
    db = DBInstance(atempdir)
    with db:
        pass


def test_create_table():
    db = DBInstance(":memory:")
    with db(("c1", "c2", "c3")):
        db.create_table("testtable", ("text", "int", "text"))

    with pytest.raises(Exception):
        db.create_table("othertable", ("text"))


@pytest.mark.usefixtures("tempdb")
class TestDatabase():
    def test_insert_row(self):
        with self.db(self.keys):
            self.db.insert_entire_row("songs",
                                      ("test-name1", "test-artist1", 1,
                                       "test-path1", "test-metadata")
                                      )
            self.db.insert_entire_row("songs",
                                      ("test-name2", "test-artist2", 2,
                                       "test-path2", "test-metadata")
                                      )

    def test_select_rows(self):
        with self.db(self.keys):
            rows1 = self.db.select_rows("songs", ("rowid", "*"),
                                        {5: "test-metadata"}
                                        )
            rows2 = self.db.select_rows("songs", ("rowid", "*"),
                                        {3: 1}
                                        )
            rows3 = self.db.select_rows("songs", ("rowid", "name"),
                                        {5: "test-metadata"}
                                        )
        assert rows1 == (
            {'rowid': 1, 'name': 'test-name1', 'artist': 'test-artist1',
                'duration': 1.0, 'file_path': 'test-path1', 'meta_dat': 'test-metadata'},
            {'rowid': 2, 'name': 'test-name2', 'artist': 'test-artist2',
                'duration': 2.0, 'file_path': 'test-path2', 'meta_dat': 'test-metadata'}
        )
        assert rows2 == ({'rowid': 1, 'name': 'test-name1', 'artist': 'test-artist1',
                          'duration': 1.0, 'file_path': 'test-path1', 'meta_dat': 'test-metadata'},)
        assert rows3 == ({'rowid': 1, 'name': 'test-name1'},
                         {'rowid': 2, 'name': 'test-name2'})

    def test_select_modifiers(self):
        with self.db(self.keys):
            rows1 = self.db.select_rows("songs", ("name", "artist"),
                                        {1: "name"}, like=True)
            rows2 = self.db.select_rows("songs", ("name", "artist"),
                                        {0: 1})
            rows3 = self.db.select_rows("songs", ("rowid",),
                                        {0: "1, 2"}, inlist=True)		# careful with strings
            rows4 = self.db.select_rows("songs", ("rowid",),
                                        {1: ""}, like=True, orderlimit="ORDER BY rowid DESC")
        assert rows1 == ({'name': 'test-name1', 'artist': 'test-artist1'},
                         {'name': 'test-name2', 'artist': 'test-artist2'})
        assert rows2 == ({'name': 'test-name1', 'artist': 'test-artist1'},)
        assert rows3 == ({'rowid': 1}, {'rowid': 2})
        assert rows4 == ({'rowid': 2}, {'rowid': 1})

    def test_get_count(self):
        with self.db(self.keys):
            count = self.db.get_count("songs")
        assert count == 2

    def test_latest_items(self):
        with self.db(self.keys):
            rows1 = self.db.get_n_latest_rows("songs", 1)
        assert rows1 == ({'rowid': 2, 'name': 'test-name2', 'artist': 'test-artist2',
                          'duration': 2.0, 'file_path': 'test-path2', 'meta_dat': 'test-metadata'},)

    def test_update(self):
        with self.db(self.keys):
            self.db.update_generic("songs", {5: "updated"}, {0: 1})
            rows1 = self.db.get_all_rows("songs")
        assert rows1 == ({'rowid': 1, 'name': 'test-name1', 'artist': 'test-artist1', 'duration': 1.0, 'file_path': 'test-path1', 'meta_dat': 'updated'},
                         {'rowid': 2, 'name': 'test-name2', 'artist': 'test-artist2', 'duration': 2.0, 'file_path': 'test-path2', 'meta_dat': 'test-metadata'})

    def test_delete(self):
        with self.db(self.keys):
            self.db.delete_rows("songs", {5: "updated"})
            rows1 = self.db.get_all_rows("songs")
        print(rows1)
        assert rows1 == ({'rowid': 2, 'name': 'test-name2', 'artist': 'test-artist2',
                          'duration': 2.0, 'file_path': 'test-path2', 'meta_dat': 'test-metadata'},)
