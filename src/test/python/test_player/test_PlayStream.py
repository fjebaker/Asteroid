import pytest
import sys
import unittest.mock as mock

# MOCK DEPENDENCIES
sys.modules['alsaaudio'] = mock.MagicMock()


import src.main.python.player.PlayStream as PlayStream
import src.main.python.player.ConditionObject as ConditionObject

def test_restrict_call():
	@PlayStream.restrict_call
	def test():
		pass
	test()
	with pytest.raises(Exception) as e:
		test()

class TestPlayStream:

	@mock.patch("wave.open")
	@mock.patch("alsaaudio.PCM", return_value=mock.MagicMock())
	def test_play(self, pcm, wopen):
		queue = mock.MagicMock()
		condObj = ConditionObject.ConditionObject()

		ps = PlayStream.PlayStream(condObj, queue)
		ps.loadsong(None)
		wopen.assert_called_once()

		ps.wf.readframes.side_effect = ["\x00\x00", False]

		ps.run()

		queue.put.assert_called_with(0)
		assert condObj.done == True




	
