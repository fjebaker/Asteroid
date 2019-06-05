# Asteroid

Music Server for parties and social gatherings.

## Install

### Prerequisites

- git
- python3
- pip

### Installation

```sh
# Clone the repository
$ git clone https://github.com/Moontemple/Asteroid
# Navigate into cloned repository
$ cd Asteroid
# Setup the virtual environment using venv
$ python3 -m venv venv
# Activate the virtual environment
$ source venv/bin/activate
# Install Asteroid in the virtual environment
$ pip install -r requirements.txt
# Test and build the docs (Optional)
$ pytest -v && (cd docs; make html; cd ..)
```

To exit the virtual environment simply run

```sh
# Exit the virtual environment
$ deactivate
```

### Running

```sh
# Ensure the virtual environment is activated
$ source venv/bin/activate
# Run with python
$ python run.py
```
