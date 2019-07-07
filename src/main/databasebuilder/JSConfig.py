"""Build config for client-side JavaScript."""

import json


def build(config):
    """Build the config for the client-side JavaScript using the dictionary
    passed in the constructor.

    :param config: Dictionary containing the config for the JavaScript
    :type config: dict
    :raises TypeError: config is not a `dict`
    """
    if not isinstance(config, dict):
        raise TypeError
    path = "src/main/web/dynamic/jsconfig.js"
    json_string = json.dumps(config)
    print_string = f"function getConfigJSON() {{\n  return JSON.parse(" + \
        json_string+");\n}\ncurrent_callback();\n"
    with open(path, "w") as my_file:
        my_file.write(print_string)
