import pytest, sys
from src.main.web.flaskserv import Playlist, History

@pytest.fixture(scope="class")
def mock_DB(request, tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("queuetest.db"))

	Playlist(fn).create_table()
	History(fn).create_table()
	request.cls.db = Playlist(fn)
	yield

@pytest.mark.usefixtures('mock_DB')
class TestPlaylist():

	def test_add(self):
		pl = self.db
		pl.add((0, 1, 1))
		pl.add((1, 1, 1))
		with pytest.raises(Exception) as e:
			pl.add((0, 1, 1))

	def test_get_playlist(self):
		pl = self.db
		assert pl.get_playlist() == ({'s_id': 0, 'u_id': 1, 'vote': 1}, {'s_id': 1, 'u_id': 1, 'vote': 1})

	def test_update_vote(self):
		pl = self.db
		pl.update_vote(0, 2)

		out = pl.get_playlist()

		assert out == ({'s_id': 0, 'u_id': 1, 'vote': 3}, {'s_id': 1, 'u_id': 1, 'vote': 1})
		pl.update_vote(1, -2)

		out = pl.get_playlist()
		assert out == ({'s_id': 0, 'u_id': 1, 'vote': 3}, {'s_id': 1, 'u_id': 1, 'vote': -1})

	def test_get_most_voted(self):
		pl = self.db
		assert pl.get_most_voted() == ({'s_id': 0, 'u_id': 1, 'vote': 3},)

	def test_remove(self):
		pl = self.db
		pl.remove(0)
		out = pl.get_playlist()
		assert out == ({'s_id': 1, 'u_id': 1, 'vote': -1},)



