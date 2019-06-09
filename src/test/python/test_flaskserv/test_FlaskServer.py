import pytest, requests, sys, os, json
sys.path.append("src/main/python/flaskserv")
sys.path.append(".")
from main import app as flask_app
import Database

@pytest.fixture(scope='module')
def temp_db(tmpdir_factory):
	fn = str(tmpdir_factory.mktemp("data").join("test.db"))

	with Database.DBInstance(fn) as db:
		db.create_table("songs", 
				("name", "artist", "duration", "meta_dat", "file_path", "UNIQUE"), 
				("text", "text", "real", "text", "text", "name, artist, file_path")
			)
		db.create_table("users", 
				("id", "name", "hash_pw", "meta_dat", "UNIQUE"),
				("long", "text", "long", "text", "id")
			)

		db.create_table("playlist", 
				("s_id", "u_id", "vote", "UNIQUE"),
				("long", "long", "long", "s_id")
			)

	Database.MusicDB(fn).add_song(
			{
				"name":"test song",
				"artist":"test users",
				"duration":"666",
				"file_path":"test_path",
				"meta_dat":""
			}
		)

	yield fn

@pytest.fixture(scope='module')
def test_client(request, temp_db):
	# set environment variables
	os.environ['USER_DB_PATH'] = temp_db
	os.environ['MUSIC_DB_PATH'] = temp_db
	os.environ['PLAYLIST_PATH'] = temp_db

	# Flask provides a way to test your application by exposing the Werkzeug test Client
	# and handling the context locals for you.
	test_client = flask_app.test_client()

	# Establish an application context before running the tests.
	ctx = flask_app.app_context()
	ctx.push()
	
	yield test_client

	ctx.pop()

class TestFlaskServ():

	def test_connection(self, test_client):
		response = test_client.get('/')
		assert response.status_code == 200

class TestServerUsers():

	def test_add_user(self, test_client):
		for i in range(1, 4):
			response = test_client.post('/register', data={"name":"TestUser" + str(i)}, follow_redirects=True)
			assert response.status_code == 201
			assert json.loads(response.data.decode()) == {"id":i}

		response = test_client.post('/register', data={"nome":"TestUser"}, follow_redirects=True)
		assert response.status_code == 400

	def test_get_user_by_id(self, test_client):
		for i in range(1, 4):
			response = test_client.get('/db/users', query_string={'id':1})
			assert response.status_code == 200
			assert json.loads(response.data.decode()) == {"id":1,"meta_dat":'',"name":"TestUser1"}
		response = test_client.get('/db/users', query_string={'id':0})
		assert response.status_code == 400
		assert json.loads(response.data.decode()) == {}

	def test_get_all_users(self, test_client):
		response = test_client.get('/db/users', query_string={'':'getAllUsers'})
		assert response.status_code == 200
		for i in json.loads(response.data.decode()):
			assert i in [
					{"id":1,"name":"TestUser1","meta_dat":''},
					{"id":2,"meta_dat":'',"name":"TestUser2"},
					{"id":3,"meta_dat":'',"name":"TestUser3"}
				]

class TestServerMusic():

	def test_get_songs(self, test_client):
		response = test_client.get("/db/music", query_string={'':'getAllSongs'})
		assert response.status_code == 200
		assert json.loads(response.data.decode()) == [{
				"name":"test song",
				"artist":"test users",
				"duration":666.0,
				"meta_dat":""
			}]

	def test_get_song_by_id(self, test_client):
		response = test_client.get("/db/music", query_string={'id':0})
		assert response.status_code == 200
		assert json.loads(response.data.decode()) == {
				"name":"test song",
				"artist":"test users",
				"duration":666.0,
				"meta_dat":""
			}
		response = test_client.get("/db/music", query_string={'id':1})
		assert response.status_code == 400

class TestPlaylist():

	def test_vote_new(self, test_client):
		response = test_client.post("/vote", data={'u_id':3, 's_id':1, 'vote':1})
		assert response.status_code == 201
		assert json.loads(response.data.decode()) == {"message":"added entry into playlist"}

	def test_vote_update(self, test_client):
		response = test_client.post("/vote", data={'u_id':3, 's_id':1, 'vote':1})
		assert response.status_code == 200
		assert json.loads(response.data.decode()) == {"message":"updated vote"}

	def test_vote_fail(self, test_client):
		response = test_client.post("/vote", data={'u_id':3, '_id':1, 'vote':1})
		assert response.status_code == 400
		assert json.loads(response.data.decode()) == {"message":"no voting operation interpreted from request"}

	def test_fetch_playlist(self, test_client):
		response = test_client.get("/vote")
		assert response.status_code == 200
		assert json.loads(response.data.decode()) == [[1, 3, 2]]

	# TODO more tests




