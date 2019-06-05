from src.main.python.databasebuilder import SetupBuild
import sys, os
import exiftool
os.environ["MUSIC_DB_PATH"] = "test.db"
if __name__ == '__main__':
	f = SetupBuild.build_music(sys.argv[1])