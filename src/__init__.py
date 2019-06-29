import unittest.mock as mock
import sys

# MOCK ALSAAUDIO -- must be done before anything else is loaded into the pytest environment
sys.modules['alsaaudio'] = mock.MagicMock()

from src.main.databasebuilder.setupfuncs import *
from src.main.databasebuilder.pyConfig import Config
