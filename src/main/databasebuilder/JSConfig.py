"""Build config for client-side JavaScript."""

import json


def build_js_config(config):
    """Build the config for the client-side JavaScript using the dictionary
    passed in the constructor.

    :param config: Dictionary containing the config for the JavaScript
    :type config: dict
    :raises TypeError: config is not a `dict`
    """
    if not isinstance(config, dict):
        raise TypeError
    path = "src/main/web/dynamic/jsconfig.js"
    config.pop('__name__','')
    json_string = json.dumps(config).replace("'","\\'")
    print_string = "function getConfigJson() {\n  return JSON.parse('" + \
        json_string+"');\n}\ncurrent_callback();"
    with open(path, "w") as my_file:
        my_file.write(print_string)
