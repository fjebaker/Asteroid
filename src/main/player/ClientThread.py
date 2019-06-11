import threading

class ClientThread(threading.Thread):
	"""
	Client thread, inheriting from :class:`threading.Thread`, spawned by :class:`src.main.python.player.INETServer.Listener`.
	Has ``self.daemon = True``.
	Will listen for incomming messages forever or until an :class:`Exception` is raised.

	:ivar dict commands: defined playback commands: "name":number of arguments (int)

	:param queue: FIFO queue to put parsed incomming messages in (puts :class:`list` objects).
	:type queue: :class:`queue.Queue`
	:param socket: the connection's object
	:type socket: :class:`socket.Socket`
	:param str addr: the connection's address
	"""

	commands = {
		"play":1,
		"pause":0,
		"stop":0,
		"close":0,
		"resume":0
	}	

	def __init__(self, queue, socket, addr):
		threading.Thread.__init__(self)
		self.queue = queue
		self.daemon = True
		self.socket = socket
		self.addr = addr

	def run(self):
		'''
		Inherited and overwritten :meth:`threading.Thread.run`; called when :attr:`self.start()` method is invoked.
		Begins listening for incomming message from client peer. Catches any :class:`Exception` thrown during this process,
		and cleans up by closing connection to :attr:`self.socket`.
		'''
		try:
			while True:
				message = self.socket.recv(4096)
				if message == b'':
					raise Exception("Client disconnected.")
				else:
					message = message.decode().replace("\n", '').replace("\r", '')
					self._handle(message)
		except Exception as e:
			print("DEBUG ERROR -- " + str(e))
			self.socket.close()

	def _handle(self, message):
		"""
		Called when a message is received.
		"""
		fragments = message.split("$ ")
		cmd = fragments[0]

		if cmd == "close":
			self.socket.close()

		if cmd in list(self.commands.keys()):
			n_args = self.commands[cmd]

			# check number of arguments is correct
			if len(fragments) - 1 == n_args:
				self(fragments)
			else:
				return 1
		return 0

	def __call__(self, fragments):
		"""
		TODO
		"""
		self.queue.put(fragments)
