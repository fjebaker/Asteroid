"""Allow users to request new songs."""
import flask


def request_song(url):
    """Requests a new song to be added to the server.

    :param url: url of the song to be downloaded
    :type url: str
    :return: `201` - success
             `400` - failure
    :rtype: flask.Response
    """
    status = 201
    return flask.Response(status=status)
