import pytest
import json


class TestUserEndpoint():

	def test_byId(self, flaskclient):
		req = flaskclient.get('/db/users')
		assert req.status_code == 200