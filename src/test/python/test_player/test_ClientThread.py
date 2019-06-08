import pytest
import unittest.mock as mock

class mocksock():
	def __init__(self, msgs):
		self.messages = msgs

	def close(self):
		pass
	
	def recv(self, num):
		for i in self.messages:
			yield i.encode()

	
