import sys
import unittest.mock as mock

# MOCK DEPENDENCIES
sys.modules['alsaaudio'] = mock.MagicMock()

from src.main.player import ClientThread


def test_run():
	mockSock = mock.MagicMock()
	mockSock.recv.side_effect = [b'play$ testpath', b'']
	queue = mock.MagicMock()
	ct = ClientThread(queue, mockSock, 'testaddr')
	ct._handle = mock.MagicMock()

	ct.run()
	assert mockSock.recv.called
	ct._handle.assert_called_once_with('play$ testpath')

def test_handle():
	mockSock = mock.MagicMock()
	mockSock.recv.side_effect = [b'play$ testpath', b'']
	queue = mock.MagicMock()
	ct = ClientThread(queue, mockSock, 'testaddr')

	assert ct._handle("test_message") == 0
	ct._handle("close")

	mockSock.close.assert_called_once()

	ct._handle("play$ test_path")
	queue.put.assert_called_with(['play', 'test_path'])

	assert ct._handle("pause$ too many arguments")
	queue.put.assert_called_with(['play', 'test_path'])