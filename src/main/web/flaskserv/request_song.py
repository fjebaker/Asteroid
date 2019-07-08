"""Allow users to request new songs."""
import requests


def request_song(url):
    """
    Requests a new song to be added to the server.

    :param url: url of the song to be downloaded
    :type url: str
    """
    request = requests.get(url)
    if request.status_code != 200:
        raise requests.HTTPError
