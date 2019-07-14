"""Unit tests for song_request_handler.py module.
"""
import pytest
import requests
from src.main.web.flaskserv import song_request_handler


def test_valid_song_url():
    """Test the get function works when a valid url is passed.
    """
    song_request_handler.get(url='https://static.xx.fbcdn.net/rsrc.php/yy/r/XFhtdTsftOC.ogg')


def test_invalid_url_raises_missing_schema():
    """Test a requests.exceptions.MissingSchema is raised when an invalid url is passed.
    """
    with pytest.raises(requests.exceptions.MissingSchema):
        song_request_handler.get(url='mp3')


def test_nonexistent_url_raises_connection_error():
    """Test a requests.exceptions.ConnectionError exception is raised when a nonexistent url is passed.
    """
    with pytest.raises(requests.exceptions.ConnectionError):
        song_request_handler.get(url='https://example.invalid/song.mp3')


def test_valid_not_song_url_raises_type_error():
    """Test a 201 status is returned when a valid url is passed.
    """
    with pytest.raises(TypeError):
        song_request_handler.get(url='https://google.com')
