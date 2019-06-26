from src.main.web.flaskserv.Database import UserDB
from flask import Response
from src.main.databasebuilder.setupfuncs import user_db_path
import os
import json

class UserHandler():
    """
    Handles different requests related to user database.

    :param request: :class:`flask:Request` instance containing the registration ``POST``.
    :returns: :class:`flask:Response` with json string and status

    ``status 404`` - error, with error message in json

    ``status 201`` - success, with saved username in json
    """

    def __init__(self, request):
        self.request = request
        self.form = request.form

    def add_user(self, name):
        """
        add user method, which adds the new user to the database. Encapsulates :class:`src.main.python.flaskserv.Database.UserDB` to add new user with max(id) + 1 as id.
        Starting id is 1.

        :param name: name of new user to add to database
        :type name: str
        """
        udb = UserDB(user_db_path())
        last_user = udb.get_latest_user()
        if last_user == ():
            new_id = 1
        else:
            new_id = int(last_user[0]["id"]) + 1

        udb.add_user((new_id, name, 0, ""))
        return new_id

    def __call__(self):
        if "name" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
            new_id = self.add_user(self.form["name"])
            json_s = {"id":new_id}
            http_s = 201
        else:
            json_s = {}             # todo, error message of what went wrong
            http_s = 400
        return Response(json.dumps(json_s), status=http_s, mimetype='application/json')


class UserHandler():
    """
    Handles different requests related to user database.

    :param request: :class:`flask:Request` instance containing the registration ``POST``.
    :returns: :class:`flask:Response` with json string and status

    ``status 404`` - error, with error message in json

    ``status 201`` - success, with saved username in json
    """

    def __init__(self, request):
        self.request = request
        self.form = request.form

    def add_user(self, name):
        """
        add user method, which adds the new user to the database.
        Encapsulates :class:`src.main.python.flaskserv.Database.UserDB` to add new user with max(id) + 1 as id.
        Starting id is 1.

        :param name: name of new user to add to database
        :type name: str
        """
        udb = UserDB(user_db_path())
        last_user = udb.get_latest_user()
        if last_user == ():
            new_id = 1
        else:
            new_id = int(last_user[0]["id"]) + 1

        udb.add_user((new_id, name, 0, ""))
        return new_id

    def __call__(self):
        if "name" in self.form and self.request.__dict__["environ"]["REQUEST_METHOD"] == 'POST':
            new_id = self.add_user(self.form["name"])
            json_s = {"id": new_id}
            http_s = 201
        else:
            json_s = {}             # todo, error message of what went wrong
            http_s = 400
        return Response(json.dumps(json_s), status=http_s, mimetype='application/json')
