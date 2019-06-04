import pytest
import sys, os

import Database

sys.path.append(".")
import model.Playlist

@pytest.fixture(scope="class")
def mock_DB(request, tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("test.db"))

	with Database.DBInstance(fn) as db:
		db.create_table("playlist", s_id="long", u_id="long", vote="long", UNIQUE="s_id")
	request.cls.fn = fn
	yield

@pytest.mark.usefixtures('mock_DB')
class TestPlaylist():

	def test_add(self):
		pl = model.Playlist.Playlist(self.fn)
		pl.add({"s_id":0, "u_id":1, "vote":1})
		pl.add({"s_id":1, "u_id":1, "vote":1})
		with pytest.raises(Exception) as e:
			pl.add({"s_id":0, "u_id":1, "vote":1})

	def test_vote(self):
		pl = model.Playlist.Playlist(self.fn)
		pl.update_vote(0, 1)

		desire = [(0, 1, 2), (1, 1, 1)]
		out = pl.get_playlist()

		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

		pl.update_vote(1, -2)

		desire = [(0, 1, 2), (1, 1, -1)]
		out = pl.get_playlist()

		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)

	def test_remove(self):
		pl = model.Playlist.Playlist(self.fn)
		pl.remove(0)
		desire = [(1, 1, -1)]
		out = pl.get_playlist()
		for i, j in zip(out, desire):
			for x, y in zip(i, j):
				assert str(x) == str(y)



