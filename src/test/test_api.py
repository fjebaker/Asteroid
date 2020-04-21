import pytest
import json
decoder = lambda x : json.loads(x.data.decode())


class TestUserEndpoint():

	def test_getAll(self, flaskclient, user_model):
		req = flaskclient.get('/db/users')
		assert req.status_code == 200
		assert len(decoder(req)) == len(user_model())

	def test_bySingleId(self, flaskclient, user_model):
		req = flaskclient.get('/db/users?u_id=2')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Bella'

	def test_byExactName(self, flaskclient, user_model):
		req = flaskclient.get('/db/users?name=Edwin')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Edwin'

	def test_returnedFields(self, flaskclient, user_model):
		req = flaskclient.get('/db/users')
		assert req.status_code == 200
		assert list(decoder(req)[0].keys()) == ['name', 'u_id']

	def test_byBadId(self, flaskclient, user_model):
		req = flaskclient.get('/db/users?u_id=-3')
		assert req.status_code == 200
		assert decoder(req) == []


class TestMusicEndpoint():

	def test_getAll(self, flaskclient, songs_model):
		req = flaskclient.get('/db/songs')
		assert req.status_code == 200
		assert len(decoder(req)) == len(songs_model())

	def test_bySingleId(self, flaskclient):
		req = flaskclient.get('/db/songs?s_id=3')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Sound and Sweat'

	def test_byManyId(self, flaskclient):
		req = flaskclient.get('/db/songs?s_id=3 4 5')
		assert req.status_code == 200
		assert len(decoder(req)) == 3

	def test_byManyBadId(self, flaskclient):
		req = flaskclient.get('/db/songs?s_id=3 4as 5')
		assert req.status_code == 200
		assert decoder(req) == {'artist':None, 'name':None, 's_id':0}

	def test_byExactName(self, flaskclient):
		req = flaskclient.get('/db/songs?name=Sound and Sweat')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Sound and Sweat'

	def test_byRegexName(self, flaskclient):
		req = flaskclient.get('/db/songs?name=Sound and*')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Sound and Sweat'

	def test_bySpecialCharsInName(self, flaskclient):
		req = flaskclient.get('/db/songs?name=Playin\' Me')
		assert req.status_code == 200
		assert decoder(req)[0]['name'] == 'Playin\' Me'

	def test_byExactArtist(self, flaskclient, songs_model):
		req = flaskclient.get('/db/songs?artist=Microwaves')
		assert req.status_code == 200
		model = songs_model('artist', 'Microwaves')
		assert len(decoder(req)) == len(model)

	def test_byRegexArtist(self, flaskclient, songs_model):
		req = flaskclient.get('/db/songs?artist=ves*')
		assert req.status_code == 200
		model = songs_model('artist', 'Microwaves')
		assert len(decoder(req)) == len(model)

	def test_returnedFields(self, flaskclient):
		req = flaskclient.get('/db/songs')
		assert req.status_code == 200
		assert list(decoder(req)[0].keys()) == ['name', 'artist', 's_id']

