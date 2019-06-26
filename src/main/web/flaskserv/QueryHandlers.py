from src.main.web.flaskserv.Database import MusicDB, UserDB
from flask import Response
import abc
import json
import os
from src.main.databasebuilder.setupfuncs import music_db_path, user_db_path

class BaseQuery(metaclass=abc.ABCMeta):
    """
    Abstract class off of which to construct query classes for the different databases

    Has :meth:`__call__` defined which uses :meth:`__getattribute__` calls on sanitised query string to produce appropriate response.
    The response method should be defined in the inheriting class.

    :param query: the query request
    :type query: byte string
    :returns: json object containing query result
    """

    def __init__(self, query):
        self.query = query

    def clean_query(self):
        """
        Sanitises and converts the query passed in constructor to a python string.
        """
        s_query = str(self.query)[2:-1].split("=")
        if len(s_query) == 1:
            self.s_query = "defaultCase"
            self.s_arg = None
        elif s_query[0] != '':
            self.s_query = s_query[0]
            self.s_arg = s_query[1]
        else:
            self.s_query = s_query[1]
            self.s_arg = None

    def __call__(self):
        self.clean_query()
        if self.s_query in dir(self):
            res = self.__getattribute__(self.s_query)()
        else:
            res = self.defaultCase()
        return res

    def _http_replace(self, string):
        string = string.replace("%20", " ")
        string = string.replace("%27", "'").replace("'", "''")
        return string

    @abc.abstractmethod
    def defaultCase(self):
        """
        Must be defined in inheriting class.

        Should return the default case / error case - i.e. if the query does not match to a known query.
        """
        raise NotImplemented()


class MusicQuery(BaseQuery):
    """
    Handler for interfacing between music database and the web server.
    Inherits from :class:`BaseQuery`.
    Encapsulates :class:`Database.MusicDB` to make database queries.

    :param query: the query request
    :type query: byte string
    :returns: :class:`flask.Response` containing query result
    """

    def __init__(self, query):
        BaseQuery.__init__(self, query)

    def name(self):
        """
        TODO
        """
        try:
            songName = str(self.s_arg)
            songName = self._http_replace(songName)
        except Exception as e:
            return self.defaultCase()

        db_result = MusicDB(music_db_path()).get_by_name(songName)
        if db_result != ():
            db_result = self._remove_path(db_result)
        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )

    def page(self):
        """
        TODO
        """
        try:
            page_id = int(self.s_arg)
        except Exception as e:
            return self.defaultCase()

        db_result = MusicDB(music_db_path()).get_page()
        if db_result != ():
            db_result = self._remove_path(db_result)
        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )

    def artist(self):
        """
        TODO
        """
        try:
            artistName = str(self.s_arg)
            artistName = self._http_replace(artistName)
        except Exception as e:
            return self.defaultCase()

        db_result = MusicDB(music_db_path()).get_by_artist(artistName)
        if db_result != ():
            db_result = self._remove_path(db_result)
        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )

    def getAllSongs(self):
        """
        Fetch from database the whole songs table. Looks in environment variable ``MUSIC_DB_PATH`` for the database path.
        Converts the list of tuples from database call into a dictionary.

        :returns: :class:`flask.Response` with json of dictionary containing all songs, and ``status==200``.
        """
        db_result = MusicDB(music_db_path()).get_all_songs()
        if db_result != ():
            db_result = self._remove_path(db_result)
        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )

    def id(self):
        """
        Query database for a specific row with id from query string parameter ``?id=``.

        :returns: :class:`flask.Response` with json of nested tuple in list containing song with specified id, and ``status==200``.
        """

        # todo could probably merge these two
        # print("DEBUG -- sargs", self.s_arg)
        s_arg = self.s_arg.split("%20")
        rowids = []
        for i in s_arg:
            try:
                i = int(i)
            except:
                continue
            else:
                rowids.append(i)
        if rowids == []:
            return self.defaultCase()

        db_result = MusicDB(music_db_path()).get_by_rowid(*rowids)
        db_result = self._remove_path(db_result)
        if len(db_result) == 0:
            return self.defaultCase()

        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )

    def _remove_path(self, db_result):
        """
        TODO
        :param db_result:
        :return:
        """
        for item in db_result:
            del item["file_path"]
        return db_result

    def defaultCase(self):
        """
        Default case is an empty dictionary.

        :returns: :class:`flask.Response` with empty json object, and ``status==400``.
        """
        return Response(
            json.dumps({}),
            status=400,
            mimetype='application/json'
        )

class UserQuery(BaseQuery):
    """
    Handler for interfacing between user database and the web server.
    Inherits from :class:`BaseQuery`.
    Encapsulates :class:`Database.UserDB` to make database queries.

    :param query: the query request
    :type query: byte string
    :returns: :class:`flask.Response` containing query result
    """

    def __init__(self, query):
        BaseQuery.__init__(self, query)


    def getAllUsers(self):
        """
        Fetch from database the whole users table. Looks in environment variable ``USER_DB_PATH`` for the database path.
        Converts the list of tuples from database call into a dictionary.

        :returns: :class:`flask.Response` with json of dictionary containing all users, and ``status==200``.
        """
        db_result = UserDB(user_db_path()).get_all_users()
        if db_result != ():
            db_result = self._remove_pw(db_result)
            for i in db_result:
                del i["rowid"]

        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )


    def id(self):
        """
        Query database for a specific row with id from query string parameter ``?id=``.

        :returns: :class:`flask.Response` with json of nested tuple in list containing user with specified id, and ``status==200``.
        """

        # todo could probably merge these two

        try:
            u_id = int(self.s_arg)
        except Exception as e:
            return self.defaultCase()

        db_result = UserDB(user_db_path()).get_by_id(u_id)
        db_result = self._remove_pw(db_result)
        if len(db_result) == 0:
            return self.defaultCase()

        return Response(
            json.dumps(db_result),
            status=200,
            mimetype='application/json'
        )


    def _remove_pw(self, db_result):
        for item in db_result:
            del item["hash_pw"]
        return db_result


    def defaultCase(self):
        """
        Default case is an empty dictionary.

        :returns: :class:`flask.Response` with empty json object, and ``status==400``.
        """
        return Response(
            json.dumps({}),
            status=400,
            mimetype='application/json'
        )