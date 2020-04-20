from src.main.web.flaskserv.Database import MusicDB, UserDB
from flask import Response
import abc
import json


class BaseQuery(metaclass=abc.ABCMeta):
    """
    Abstract class off of which to construct query classes for the different databases

    Has :meth:`__call__` defined which uses :meth:`__getattribute__` calls on sanitised query string to produce appropriate response.
    The response method should be defined in the inheriting class.

    :param query: the query request dict
    :type query: dict
    :returns: json object containing query result
    """

    def __init__(self, query):
        if type(query) == type(b''):
            query = query.decode().split('=')
            if len(query) == 1:
                query.append('')
            query = {query[0]:query[1]}
        self.query = query
        self.s_arg = ''

    def __call__(self):
        print(self.query)
        if self.query == {}:
            return
        key, value = list(self.query.items())[0]
        if key in dir(self):
            self.s_arg = value
            res = self.__getattribute__(key)()
        else:
            res = self.defaultCase()
        return res

    def _http_replace(self, string):
        string = string.replace("%20", " ")
        string = string.replace("%27", "'").replace("'", "''")
        return string

    def response(self, result):
        if len(result) == 0:
            return Response(
                json.dumps([]),
                status=200,
                mimetype='application/json'
            )
        else:
            formatter = lambda x: {k:v for k,v in x.items() if k != '_id'}
            if type(result) == list:
                result = [formatter(i) for i in result]
            else:
                result = formatter(result)
            return Response(
                json.dumps(result),
                status=200,
                mimetype='application/json'
            )

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

        db_result = MusicDB().get_by_name(songName)
        return self.response(db_result)

    def page(self):
        """
        TODO
        """
        try:
            page_id = int(self.s_arg)
        except Exception as e:
            return self.defaultCase()

        db_result = MusicDB().get_page()
        return self.response(db_result)

    def artist(self):
        """
        TODO
        """
        try:
            artistName = str(self.s_arg)
            artistName = self._http_replace(artistName)
        except Exception as e:
            return self.defaultCase()

        db_result = MusicDB().get_by_artist(artistName)
        return self.response(db_result)

    def getAllSongs(self):
        """
        Fetch from database the whole songs table. Looks in environment variable ``MUSIC_DB_PATH`` for the database path.
        Converts the list of tuples from database call into a dictionary.

        :returns: :class:`flask.Response` with json of dictionary containing all songs, and ``status==200``.
        """
        db_result = MusicDB().get_all_songs()
        return self.response(db_result)

    def id(self):
        """
        Query database for a specific row with id from query string parameter ``?id=``.

        :returns: :class:`flask.Response` with json of nested tuple in list containing song with specified id, and ``status==200``.
        """

        # todo could probably merge these two
        # print("DEBUG -- sargs", self.s_arg)
        s_arg = self.s_arg.split(" ")
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

        db_result = MusicDB().get_by_id(*rowids)
        return self.response(db_result)

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
        db_result = UserDB().get_all_users()

        # can return empty without throwing default, so has custom return
        if len(db_result) == 0:
            return Response(json.dumps([]), status=200, mimetype='application/json')
        return self.response(db_result)

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

        db_result = UserDB().get_by_id(u_id)
        return self.response(db_result)

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
