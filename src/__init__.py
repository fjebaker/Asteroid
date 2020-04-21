from src.main.databasebuilder.pyConfig import Config
import src.main.databasebuilder.JSConfig as JSConfig
import unittest.mock as mock
import sys

# MOCK ALSAAUDIO -- must be done before anything else is loaded into the pytest environment
sys.modules['alsaaudio'] = mock.MagicMock()
