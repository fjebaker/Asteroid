import pytest
import sys
from src.main.player import ConditionObject


class TestConditionObject():
    def test_init_state(self):
        co = ConditionObject()
        assert co.play is True
        assert co.pause is False
        assert co.done is False

    def test_lock_exists(self):
        import threading
        co = ConditionObject()
        assert type(co.lock) is type(threading.Lock())
