import pytest
import sys
sys.path.append("src/main/python/player")
sys.path.append("src/test/python/player")

# mock alsaaudio
module = type(sys)('alsaaudio')
class MockStream:
	setformat = ""
	setchannels = ""
	setrate = ""
	setperiodsize = ""
	def write(*args, **kwargs):
		pass
module.PCM = lambda a, b, c: MockStream()
sys.modules['alsaaudio'] = module

import PlayStream, ConditionObject
import queue
co = ConditionObject.ConditionObject()
q = queue.Queue()
ps = PlayStream.PlayStream(co, q)

class TestPlayStream():
	def test_restrict_call(self):
		@PlayStream.restrict_call
		def test():
			pass

		test()
		with pytest.raises(Exception) as e:
			test()

	
