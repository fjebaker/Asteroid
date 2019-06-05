from socket import socket, AF_INET, SOCK_STREAM
import importlib, os
import src.main.python.player.ClientThread as ct_module
from src.main.python.player.AudioHandler import AudioHandler
from queue import Queue

class Listener():
	"""
	TODO
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

		serversocket = socket(AF_INET, SOCK_STREAM)
		serversocket.bind((self.host, self.port))
		self.srvsocket = serversocket
		self.clients = {}

	def start(self):
		"""
		TODO
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
		ct = ct_module.ClientThread(self.queue, csocket, addr)
		ct.start()
		self.clients[addr] = ct
