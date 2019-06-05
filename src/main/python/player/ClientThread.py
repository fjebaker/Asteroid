import threading, sys
from queue import Queue

class ClientThread(threading.Thread):
	"""
	TODO
	"""

	commands = {	# 		command : number of arguments, should make into a metaclass
		"play":1,
		"pause":0,
		"stop":0,
		"close":0
	}	

	def __init__(self, queue, socket, addr):
		threading.Thread.__init__(self)
		self.queue = queue
		self.daemon = True
		self.socket = socket
		self.addr = addr

	def run(self):
		"""
		TODO
		"""
		try:
			while True:
				message = self.socket.recv(4096)
				if message == b'':
					raise Exception("Client disconnected.")
				else:
					message = message.decode().replace("\n", '').replace("\r", '')
					self.handle(message)
		except Exception as e:
			print("DEBUG ERROR -- " + str(e))
			self.socket.close()

	def handle(self, message):
		"""
		TODO
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

	def __call__(self, fragments):
		"""
		TODO
		"""
		self.queue.put(fragments)
