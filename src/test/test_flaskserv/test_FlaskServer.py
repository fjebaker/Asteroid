import pytest
import sys
import os
import json
from src.main.web.flaskserv.main import app as flask_app
from src.main.web.flaskserv import MusicDB, UserDB, Playlist, History


@pytest.fixture(scope='module')
def temp_db(tmpdir_factory):
    fn = str(tmpdir_factory.mktemp("data").join("test.db"))
    mdb = MusicDB(fn)
    mdb.create_table()
    mdb.add_song(("testname1", "testartist1", 1, "testpath1", "testmetadata1"))
    mdb.add_song(("testname2", "testartist'2", 2, "testpath2", "testmetadata2"))
    UserDB(fn).create_table()
    Playlist(fn).create_table()
    History(fn).create_table()
    yield fn


@pytest.fixture(scope='module')
def test_client(temp_db):
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
            response = test_client.post('/register', data={"name": "TestUser" + str(i)}, follow_redirects=True)
            assert response.status_code == 201
            assert json.loads(response.data.decode()) == {"id": i}

        response = test_client.post('/register', data={"nome": "TestUser"}, follow_redirects=True)
        assert response.status_code == 400

    def test_get_user_by_id(self, test_client):
        for i in range(1, 4):
            response = test_client.get('/db/users', query_string={'id': i})
            assert response.status_code == 200
            assert json.loads(response.data.decode()) == [{'id': i, 'name': 'TestUser' + str(i), 'meta_dat': ''}]
        response = test_client.get('/db/users', query_string={'id': 0})
        assert response.status_code == 400
        assert json.loads(response.data.decode()) == {}

    def test_get_all_users(self, test_client):
        response = test_client.get('/db/users', query_string={'': 'getAllUsers'})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'id': 1, 'name': 'TestUser1', 'meta_dat': ''},
            {'id': 2, 'name': 'TestUser2', 'meta_dat': ''},
            {'id': 3, 'name': 'TestUser3', 'meta_dat': ''}]


class TestServerMusic():

    def test_get_songs(self, test_client):
        response = test_client.get("/db/music", query_string={'': 'getAllSongs'})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'rowid': 1, 'name': 'testname1', 'artist': 'testartist1', 'duration': 1.0, 'meta_dat': 'testmetadata1'},
            {'rowid': 2, 'name': 'testname2', 'artist': "testartist'2", 'duration': 2.0, 'meta_dat': 'testmetadata2'}]

    def test_get_song_by_id(self, test_client):
        response = test_client.get("/db/music", query_string={'id': 1})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'rowid': 1, 'name': 'testname1', 'artist': 'testartist1', 'duration': 1.0, 'meta_dat': 'testmetadata1'}]

        response = test_client.get("/db/music", query_string={'id': 3})
        assert response.status_code == 400

    def test_get_by_name(self, test_client):
        response = test_client.get("/db/music", query_string={"name": "test"})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'rowid': 1, 'name': 'testname1', 'artist': 'testartist1', 'duration': 1.0, 'meta_dat': 'testmetadata1'},
            {'rowid': 2, 'name': 'testname2', 'artist': "testartist'2", 'duration': 2.0, 'meta_dat': 'testmetadata2'}]

        response = test_client.get("/db/music", query_string={"name": "deadbeef'"})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == []

    def test_get_by_artist(self, test_client):
        response = test_client.get("/db/music", query_string={"artist": "test"})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'rowid': 1, 'name': 'testname1', 'artist': 'testartist1', 'duration': 1.0, 'meta_dat': 'testmetadata1'},
            {'rowid': 2, 'name': 'testname2', 'artist': "testartist'2", 'duration': 2.0, 'meta_dat': 'testmetadata2'}]

        response = test_client.get("/db/music", query_string={"artist": "deadbeef'"})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == []

        # special chars
        response = test_client.get("db/music", query_string={"artist": "st'"})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [
            {'rowid': 2, 'name': 'testname2', 'artist': "testartist'2", 'duration': 2.0, 'meta_dat': 'testmetadata2'}]


class TestPlaylist():

    def test_vote_new(self, test_client):
        response = test_client.post("/vote", data={'u_id': 3, 's_id': 1, 'vote': 1})
        assert response.status_code == 201
        assert json.loads(response.data.decode()) == {"message": "added entry into playlist"}

    def test_vote_update(self, test_client):
        response = test_client.post("/vote", data={'u_id': 3, 's_id': 1, 'vote': 1})
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == {"message": "updated vote"}

    def test_vote_fail(self, test_client):
        response = test_client.post("/vote", data={'u_id': 3, '_id': 1, 'vote': 1})
        assert response.status_code == 400
        assert json.loads(response.data.decode()) == {"message": "no voting operation interpreted from request"}

    def test_fetch_playlist(self, test_client):
        response = test_client.get("/vote")
        assert response.status_code == 200
        assert json.loads(response.data.decode()) == [{'s_id': 1, 'u_id': 3, 'vote': 2}]
