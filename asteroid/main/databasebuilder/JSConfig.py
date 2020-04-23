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
    path = "src/static/jsconfig.js"
    config.pop('__name__','')
    json_string = json.dumps(config).replace("'","\\'")
    print_string = "var CONFIG = JSON.parse('" + \
        json_string+"');\n" + \
        "LOADER.loading_callback();"
    with open(path, "w") as my_file:
        my_file.write(print_string)
