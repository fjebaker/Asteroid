import pytest, sys, os
from queue import Queue
import unittest.mock as mock

os.environ['LISTENER_HOST'] = "localhost"
os.environ['LISTENER_PORT'] = "9999"

sys.modules['alsaaudio'] = mock.MagicMock()
import src.main.python.player.INETServer as Listener

def patchall(func):
	@mock.patch('src.main.python.player.INETServer.socket')
	@mock.patch('src.main.python.player.INETServer.AudioHandler')
	@mock.patch('src.main.python.player.INETServer.ClientThread')
	def wrap(c, a, s):
		s.socket.return_value = s.socket
		s.socket.accept.return_value = (s.socket, "testclient")
		return func(c, a, s)
	return wrap

@patchall
def test_startup(ct, ah, sock):
	l = Listener.Listener()
	l._setup()
	assert ah.called
	assert sock.socket.called

@patchall
def test_attach(ct, ah, sock):
	l = Listener.Listener()
	l._setup()
	l.queue = 'testqueue' 
	l._attach('testsock', 'testaddr')
	ct.assert_called_with('testqueue', 'testsock', 'testaddr')

@patchall
def test_start(ct, ah, sock):
	l = Listener.Listener()
	l._setup()
	l._attach = lambda : (_ for _ in ()).throw(Exception('test'))
	with pytest.raises(Exception) as e:
		l.start()
	assert sock.socket.accept.called
