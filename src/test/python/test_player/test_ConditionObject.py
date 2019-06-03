import pytest
import sys
sys.path.append("src/main/python/player")
import ConditionObject

class TestConditionObject():
	def test_init_state(self):
		co = ConditionObject.ConditionObject()
		assert co.play is True
		assert co.pause is False
		assert co.done is False

	def test_lock_exists(self):
		import threading
		co = ConditionObject.ConditionObject()
		assert type(co.lock) is type(threading.Lock())
