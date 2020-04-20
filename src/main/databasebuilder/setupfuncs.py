from functools import lru_cache
from src.main.databasebuilder.pyConfig import Config


@lru_cache(None)
def db_path():
    print("Getting music database path...")
    path = Config().getval("Databases", "db-path")
    return path

@lru_cache(None)
def db_address():
	addr = Config().getval("Databases", "db-address")
	port = Config().getval("Databases", "db-port")
	return addr, int(port)


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
