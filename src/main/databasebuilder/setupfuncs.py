from functools import lru_cache
from src.main.databasebuilder.pyConfig import Config

@lru_cache(None)
def music_db_path():
    print("Getting music database path...")
    path = Config().getval("Databases", "music-db-path")
    return path

@lru_cache(None)
def user_db_path():
    print("Getting user database path...")
    path = Config().getval("Databases", "user-db-path")
    return path

@lru_cache(None)
def playlist_db_path():
    print("Getting playlist database path...")
    path = Config().getval("Databases", "playlist-db-path")
    return path

@lru_cache(None)
def get_flask_port():
    return None

@lru_cache(None)
def get_flask_address():
    return None

@lru_cache(None)
def get_player_port():
    return None

@lru_cache(None)
def get_player_address():
    return None