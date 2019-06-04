import src.main.python.flaskserv.main as main
import os, sys

# TODO -- it's fecking SQLINJECTION vulnerable

os.environ["MUSIC_DB_PATH"] = "test.db"
os.environ["USER_DB_PATH"] = "test.db"


if __name__ == "__main__":
	main.app.run("0.0.0.0", "8080")
