import sys, os

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
		print("DEBUG: MockStream::write() with args='{}', kwargs='{}'".format(args, kwargs))
module.PCM = lambda a, b, c: MockStream()
module.PCM_PLAYBACK = None
module.PCM_NORMAL = None
module.PCM_FORMAT_S16_LE = None
sys.modules['alsaaudio'] = module


os.environ["LISTENER_HOST"] = "localhost"
os.environ["LISTENER_PORT"] = "6666"
os.environ["PLAYLIST_PATH"] = "test.db"
os.environ["MUSIC_PATH"] = "test.db"

from src.main.python.player.INETServer import Listener

a = Listener()
a.start()