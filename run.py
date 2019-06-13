import os, sys
os.environ["MUSIC_DB_PATH"] = "test.db"
os.environ["USER_DB_PATH"] = "test.db"
os.environ["PLAYLIST_PATH"] = "test.db"

HEADER = r"""               _       _                 _     _ 
 _ __  _   _  /_\  ___| |_ ___ _ __ ___ (_) __| |
| '_ \| | | |//_\\/ __| __/ _ \ '__/ _ \| |/ _` |
| |_) | |_| /  _  \__ \ ||  __/ | | (_) | | (_| |
| .__/ \__, \_/ \_/___/\__\___|_|  \___/|_|\__,_|
|_|    |___/   				v0.0.0 
		     ?:~j  github.com/Moontemple/Asteroid	
 developed by Fergus Baker, JR Mitchell, Sam Hollow, Ben Shellswell
"""

"""
	TODO
	====
	-- it's fecking SQLINJECTION vulnerable
	-- use less environment variables
	-- all databases should have id
"""

def run_flask(host="0.0.0.0", port=8080):
	print("[*] Starting flask HTTP server...")
	import src.main.web.flaskserv.main as main
	main.app.run(host, port)

def run_player(host="localhost", port="6666"):
	try:
		import alsaaudio
	except:
		from time import sleep
		print("[*] No package 'alsaaudio' found, creating a mock...")
		# mock alsaaudio
		module = type(sys)('alsaaudio')
		class MockStream:
			def setformat(self, *args, **kwargs):
				pass
			def setchannels(self, *args, **kwargs):
				pass
			def setrate(self, *args, **kwargs):
				pass
			def setperiodsize(self, *args, **kwargs):
				pass
			def write(self, *args, **kwargs):
				#print("DEBUG: MockStream::write() with args='{}', kwargs='{}'".format(args, kwargs))
				#print("DEBUG -- mock stream got data")
				#sleep(1)
				pass
		module.PCM = lambda a, b, c: MockStream()
		module.PCM_PLAYBACK = None
		module.PCM_NORMAL = None
		module.PCM_FORMAT_S16_LE = None
		sys.modules['alsaaudio'] = module
		print("[+] Mock 'alsaaudio' created!")
	else:
		print("[*] Package 'alsaaudio' found!")
	finally:
		print("[*] Starting player INET server...")
		os.environ["LISTENER_HOST"] = host
		os.environ["LISTENER_PORT"] = port
		from src.main.player import Listener
		Listener().start()

class databases:

	@staticmethod
	def build_music(loc):
		print("[+] adding '{}' table in '{}'...".format("songs", os.environ["MUSIC_DB_PATH"]))
		from src.main.databasebuilder import build_music
		build_music(loc)
		print("[*] Done building Music.")

	@staticmethod
	def build_user():
		print("[+] adding '{}' table in '{}'...".format("users", os.environ["USER_DB_PATH"]))
		from src.main.databasebuilder import build_user
		build_user()
		print("[*] Done building Users.")

	@staticmethod
	def build_playlist():
		print("[+] adding '{}' table in '{}'...".format("playlist", os.environ["PLAYLIST_PATH"]))
		from src.main.databasebuilder import build_playlist
		build_playlist()
		print("[*] Done building Playlist.")

	@staticmethod
	def build_all():
		print("\n[*] Building all tables in database...")
		databases.build_music(None)
		databases.build_playlist()
		databases.build_user()

	@staticmethod
	def clear(path):
		from src.main.databasebuilder import clear
		print("\n[-] Deleting old database...")
		clear(path)

def usage():
	print("""Usage:
  (recommend you make a shellscript in PATH to save you a './' or 'python')
  
  - to run flask HTTP server:
  	run flask [[host port]]
  default: 0.0.0.0:8080
  
  - to run player INET server:
  	run player [[host port]]
  default: localhost:6666
  
  - to list database related commands:
  	run database""")

def database_usage():
	print("""  database usage:
  (currently only changes test.db until config files lift env var dependency)

  - to create a blank database:
    run database fresh

  - to load in songs:
  	run database load music [music folder]""")

if __name__ == '__main__':
	if len(sys.argv) == 1:
		usage()
		exit(0)
	print(HEADER)
	cmd = sys.argv[1:]
	print(".::Executing '{}'::.".format(' '.join(cmd)))
	if 'database' in cmd:
		if len(cmd) == 1:
			database_usage()
			exit(0)
		if cmd[1] == 'fresh' and len(cmd) == 2:
			databases.clear('test.db')
			databases.build_all()
		elif cmd[1] == 'fresh' and cmd[2] == 'playlist' and len(cmd) == 3:
			databases.build_playlist()
		elif cmd[1] == 'load' and cmd[2] == 'music' and len(cmd) == 4:
			databases.build_music(cmd[3])
		else:
			database_usage()
			exit(0)
	elif 'flask' in cmd:
		if len(cmd) == 3:
			run_flask(cmd[1], cmd[2])
		elif len(cmd) == 2:
			run_flask(cmd[1])
		else:
			run_flask()
	elif 'player' in cmd:
		if len(cmd) == 3:
			run_player(cmd[1], cmd[2])
		elif len(cmd) == 2:
			run_player(cmd[1])
		else:
			run_player()
	else:
		usage()
		exit(0)
