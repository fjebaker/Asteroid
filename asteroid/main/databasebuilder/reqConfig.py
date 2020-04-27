import configparser
import os

class RequestConfig(configparser.ConfigParser):
    """ class for accessing request method config info and allowing it to be accessed """

    def __init__(self):
        configparser.ConfigParser.__init__(self)
        self.path = os.environ["ASTEROID_REQUEST_CONFIG_PATH"]
        self.read(self.path)

    def getval(self, section, option, raw=False):
        """ gets the option value from section """
        return super().get(section, option)
