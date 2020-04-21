import pytest
import sys
import unittest.mock as mock

@pytest.fixture
def flaskclient(mongodb):
	# mock the database
	module = type(sys)('src.main.asteroid_api.common.__database')
	module.mongo = mock.MagicMock()
	module.mongo.init_app = mock.MagicMock()
	module.mongo.db = mongodb
	sys.modules['src.main.asteroid_api.common.__database'] = module

	from src.main import init
	app = init("config.TestAPI")
	with app.test_client() as client:
		yield client