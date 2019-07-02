from flask import Response
from src.main.web.flaskserv.playqueue.Playlist import Playlist
from src.main.web.flaskserv.playqueue.History import History
import os
import json

from src.main.databasebuilder.setupfuncs import playlist_db_path


class Vote:
    """Vote handling class. Handles both ``POST`` and ``GET`` requests.

    :param request: :class:`flask.Request` object containing the request information.
    :returns: :class:`flask.Response` with result of operation.

    * if ``POST``: returns json with a ``message`` index, and ``status==200`` if vote updated and ``status==201`` if new song item created in ``playlist`` table.

    * if ``GET``: returns the whole ``playlist`` table.
    """

    def __init__(self, request):
        self.request = request
        self.form = request.form

    def handle_vote(self, s_id, u_id, vote):
        """
        Handles the vote. Manipulates the ``playlist`` table, which it finds in the database
        given by the environment variable ``PLAYLIST_PATH``. Checks if ``s_id`` already in ``playlist`` in which case
        it updates the vote by calling :meth:``src.main.python.flaskserv.playqueue.Playlist.update_vote``.
        If not already in ``playlist``, adds by calling :meth:``src.main.python.flaskserv.playqueue.Playlist.add``

        :param int s_id: the song ``rowid``
        :param int u_id: user ``id``
        :param int vote: the value to adjust vote by if song already in ``playlist``, else to set to.

        :returns: :class:``flask.Response``
        """

        pl = Playlist(playlist_db_path())
        playlist = pl.get_playlist()

        # check if already exists in database
        exists = False
        # print("DEBOOF -- ", playlist, s_id)
        for item in playlist:
            if int(s_id) == int(item['s_id']):
                exists = True

        if exists:
            pl.update_vote(s_id, vote)
            return Response(
                json.dumps({"message": "updated vote"}),
                status=200,
                mimetype='application/json'
            )
        else:
            pl.add((s_id, u_id, vote))
            return Response(
                json.dumps({"message": "added entry into playlist"}),
                status=201,
                mimetype='application/json'
            )

    def __call__(self):
        if self.request.__dict__["environ"][
                "REQUEST_METHOD"] == 'GET' and self.request.query_string.decode() == '=currentSong':
            return Response(
                json.dumps(History(playlist_db_path()).get_current_song()),
                status=200,
                mimetype='application/json'
            )

        if self.request.__dict__["environ"]["REQUEST_METHOD"] == 'GET' and self.request.query_string.decode() == '':
            return Response(
                json.dumps(Playlist(playlist_db_path()).get_playlist()),
                status=200,
                mimetype='application/json'
            )

        if "s_id" in self.form and "u_id" in self.form and "vote" in self.form and self.request.__dict__["environ"][
                "REQUEST_METHOD"] == 'POST':
            return self.handle_vote(self.form['s_id'], self.form["u_id"], self.form["vote"])

        return Response(json.dumps({"message": "no voting operation interpreted from request"}), status=400)
