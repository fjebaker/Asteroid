# Asteroid Requests

Asteroid's requests are done via git submoduling.

## To set up a new request method from a request module github

1. From the request_modules folder, submodule the request repository:
```sh
$ git submodule add {repo url}
```

2. Install any extra requirements (ensure sourced into the correct virtual environment first)
```sh
# Navigate into the newly created directory
(environment) $ cd {ModuleName}
# Install any further requirements
(environment) $ pip install -r requirements.txt
```

3. Add an instance of the request method to the module_config.ini file:
```
[DisplayName] #What the tab should display as on the frontend
module-name = {ModuleName} #The name of the module, i.e the name of the directory created in step 1
```
Further necessary keys should be found in request_modules/{ModuleName}/KEYS.md

## To create a new request module

The request module must, in its top level, contain the following things:

### __init__.py

The __init__.py file must contain two functions:

#### get_parser(config)

This function should take a dict of config settings and return a RequestParser() object which may be used to parse POST requests for the requester with specified configuration

#### get_song(config,**kwargs)

This function should take a dict of config settings and may take further keyword args, which should match up to the keys provided in get_parser for the specified configuration.
It should do whatever it needs to do to create the requested song as a .wav file, and then return a dict of song information with the keys ["duration", "file_path", "artist", "name"].

### tab.js

This file should be a js file that is called whenever the request tab for this requester is opened in the Asteroid frontend.
It may call upon any of the already initialised objects (e.g BODY_CONTENT)

### requirements.txt

The requirements file for installing any requirements that the python of the module has

### KEYS.md

A markdown file describing any necessary and optional further config keys used for setting up instances of the requester
