import socket
import os
from src.main.player.ClientThread import ClientThread
from src.main.player.AudioHandler import AudioHandler
from queue import Queue

class Listener():
	"""
	Low level socket server for spawning a :class:`src.main.python.player.ClientThread` per each incomming connection. 
	Holds the :class:`queue.Queue` for communicating between the :class:`src.main.python.player.PlayStream`.

	Threaded, able to handle 5 simultaneous incomming connections - performs no checks.
	"""
	def __init__(self):
		# get config
		self.host = os.environ["LISTENER_HOST"]
		self.port = int(os.environ["LISTENER_PORT"])
		self.queue = Queue()

	def _setup(self):
		"""
		TODO
		"""
		AudioHandler(self.queue).start()

		serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		serversocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
		serversocket.bind((self.host, self.port))
		self.srvsocket = serversocket
		self.clients = {}

	def start(self):
		"""
		Start the listening server on designated :attr:`self.host` and :attr:`self.port`.
		"""
		self._setup()
		print("Server starting at {}:{}".format(self.host, self.port))
		self.srvsocket.listen(5)
		while True:
			clientsocket, address = self.srvsocket.accept()
			self._attach(clientsocket, address)

	def _attach(self, csocket, addr):
		"""
		TODO
		"""
		print("DEBUG -- connection from {}".format(addr))
		ct = ClientThread(self.queue, csocket, addr)
		ct.start()
		self.clients[addr] = ct
