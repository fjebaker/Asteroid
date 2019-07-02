"""Contain JSConfiger module."""
import json


class JSConfiger:
    """Build config for client-side JavaScript."""

    def __init__(self, config: dict):
        """Create an instace of JSConfiger.

        :param config: Dictionary containing the config for the JavaScript
        :type config: dict
        :raises TypeError: config is not a `dict`
        """
        if not isinstance(config, dict):
            raise TypeError
        self.config = config
        self.path = "src/main/web/dynamic/jsconfig.js"

    def build_config(self):
        """Build the config for the client-side JavaScript using the dictionary
        passed in the constructor.

        :return: `1` if writing succeeds, `0` if writing fails.
        :rtype: int
        """
        json_string = json.dumps(self.config)
        print_string = f"function getConfigJSON() {{\n  return JSON.parse(" + \
            json_string+");\n}\ncurrent_callback();\n"
        with open(self.path, "w") as my_file:
            my_file.write(print_string)
