from src.main.python.player.PlayStream import PlayStream 
from src.main.python.player.ConditionObject import ConditionObject 
from src.main.python.flaskserv.model.Playlist import Playlist
from src.main.python.flaskserv.Database import MusicDB
from queue import Queue
import threading, os

class AudioHandler(threading.Thread):
	"""
	Controls playback
	"""
	def __init__(self, queue):
		threading.Thread.__init__(self)
		self.queue = queue
		self.out_queue = Queue()
		self.daemon = True
		self.current_player = None
		self.condObj = ConditionObject()

	def run(self):
		"""
		TODO

		needs to check if a song is playing, if not request next file and then play
		"""
		while True:
			msg = self.queue.get()
			print("DEBUG", msg)
			self.__getattribute__(msg[0])(msg)

	def fetch_playlist_item(self):
		"""
		TODO
		"""

		# todo: token checks

		pl = Playlist(os.environ["PLAYLIST_PATH"])
		playlist = pl.get_playlist()

		if playlist == []:
			return None

		most_voted_song = sorted(playlist, key=lambda x: int(x[2]))[-1]		
		pl.remove(most_voted_song[0])
		return most_voted_song

	def get_path_from_database(self):
		"""
		TODO
		"""
		n_item = self.fetch_playlist_item()
		if n_item == None:
			# TODO
			return None

		song = MusicDB(os.environ["MUSIC_PATH"]).get_by_rowid(n_item[0]+1)
		return song["path"]

	def play(self, *args):
		"""
		TODO
		"""
		path = args[1]
		if self.current_player != None:
			self.stop()

		# check file exists
		if not os.path.isfile(fname)
			print("DEBUG -- file does not exist", fname)
			return

		path = self.get_path_from_database()
		player = PlayStream(self.condObj, self.out_queue)
		player.loadsong(path)
		player.start()
		self.current_player = player

	def pause(self, *args):
		"""
		TODO
		"""
		self.condObj.toggle_pause()

	def stop(self, *args):
		"""
		TODO
		"""
		with self.condObj.lock():
			self.condObj.play = False
		self.condObj = ConditionObject()
		self.current_player = None
