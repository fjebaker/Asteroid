"""Allow users to request new songs."""
import requests


def request_song(url):
    """Requests a new song to be added to the server.

    :param url: url of the song to be downloaded
    :type url: str
    :raises: requests.exceptions.MissingSchema: URL is invalid
    :raises: requests.exceptions.ConnectionError: Failed to connect to URL
    """
    requests.get(url)
