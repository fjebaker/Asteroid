from src.main.python.player.PlayStream import PlayStream 
from src.main.python.player.ConditionObject import ConditionObject 
from src.main.python.flaskserv.model.Playlist import Playlist
from src.main.python.flaskserv.Database import MusicDB
from queue import Queue
import threading, os

class AudioHandler(threading.Thread):
	"""
	Controlls how the music is being played. Will spawn instances of :class:`src.main.python.player.PlayStream` for each song.
	Handles the :class:`src.main.python.player.ConditionObject` in response to INET server commands.
	Determines playback from the music database also handles by the HTTP server.
	Has ``self.daemon = True``.

	:param queue: queue to get new INET server commands.
	:type queue: :class:`queue.Queue`
	"""
	def __init__(self, queue):
		threading.Thread.__init__(self)
		self.queue = queue
		self.out_queue = Queue()
		self.daemon = True
		self.current_player = None
		self.condObj = ConditionObject()

		self.first = True 		# hacky, since first call must be over socket msg

	def run(self):
		'''
		Inherited and overwritten :meth:`threading.Thread.run`; called when :attr:`self.start()` method is invoked.
		Checks if a new message has been received in :attr:`self.queue`, and if so, acts upon it.
		Else, checks if current playback has finished, i.e. ``ConditionObject.done == True``,
		in which case tries to fetch a new item from the ``playlist`` table in the database, and if one exists,
		will play most voted song.
		'''
		while True:
			try:
				msg = self.queue.get(timeout=0.1)
			except:
				play = False
				with self.condObj.lock:
					if self.condObj.done or self.first:
						play = True
				if play:
					self.play()

			else:
				print("DEBUG", msg)
				self.__getattribute__(msg[0])(*msg)

	def fetch_playlist_item(self):
		"""
		Uses an instance of :class:`src.main.python.flaskserv.model.PLaylist` to fetch the current ``playlist`` table.
		Determines most voted song, and removes it from ``playlist``.

		:returns: most voted song
		:rtype: tuple
		"""

		pl = Playlist(os.environ["PLAYLIST_PATH"])
		playlist = pl.get_playlist()

		if playlist == []:
			return None

		most_voted_song = sorted(playlist, key=lambda x: int(x[2]))[-1]		
		pl.remove(most_voted_song[0])
		return most_voted_song

	def get_path_from_database(self):
		"""
		Queries the ``songs`` table with :class:`src.main.python.flaskserv.Database.MusicDB` to determine
		information on the next song to play given the song id from :meth:`self.fetch_playlist_item`.

		:returns: the path to the most voted song
		:rtype: str
		"""
		n_item = self.fetch_playlist_item()
		if n_item == None:
			# TODO
			return None

		song = MusicDB(os.environ["MUSIC_DB_PATH"]).get_by_rowid(n_item[0]+1)[0]
		return song[3]

	def play(self, *args):
		"""
		Begin the playback -- first checks if ``*args`` contains a path, else calls :meth:`self.get_path_from_database`
		to fetch a song path. Then checks if the file exists, returns ``None`` if false. Stops the current playback if a player
		exists by calling :meth:`self.stop`. Creates a new :class:`src.main.python.player.PlayStream` instance, loads the song
		and starts the playback. Finally, sets :attr:`self.curret_player` to new instance.
		"""
		if len(args) == 2:
			path = args[1]
		else:
			path = self.get_path_from_database()
			if path == None:
				return
			# check file exists
		if not os.path.isfile(path):
			print("DEBUG -- file does not exist", path)
			return

		if self.current_player != None:
			self.stop()

		player = PlayStream(self.condObj, self.out_queue)
		player.loadsong(path)
		player.start()
		self.current_player = player
		self.first = False

	def pause(self, *args):
		"""
		Pause the playback -- calls :meth:`src.main.python.player.ConditionObject.toggle_pause` on own instance.
		"""
		self.condObj.toggle_pause()

	def stop(self, *args):
		"""
		Sets the current instace of :attr:`src.main.python.player.ConditionObject.play` to ``False``, then spawns fresh instance
		and sets :attr:`self.current_player` to ``None``.
		"""
		with self.condObj.lock:
			self.condObj.play = False
		self.condObj = ConditionObject()
		self.current_player = None
