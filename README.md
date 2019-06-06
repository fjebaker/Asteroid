# Asteroid

Music Server for parties and social gatherings.

## Install

### Prerequisites

- [git](https://git-scm.com/)
- [python3](https://www.python.org/2)
- [pip](https://pypi.org/project/pip/)

### Installation

```sh
# Clone the repository
$ git clone https://github.com/Moontemple/Asteroid
# Navigate into cloned repository
$ cd Asteroid
# Setup the virtual environment using venv
$ python3 -m venv venv
```

<!-- Sourced from https://docs.python.org/3/library/venv.html-->

Once a virtual environment has been created, it can be “activated” using a script in the virtual environment’s binary directory.

```sh
# bash/zsh
$ source venv/bin/activate
# fish
$ . venv/bin/activate.fish
# csh/tcsh
$ source venv/bin/activate.csh
# cmd.exe
C:\> venv\Scripts\activate.bat
# PowerShell
PS C:\> venv\Scripts\Activate.ps1
```

```sh
# Install Asteroid in the virtual environment
$ pip install -r requirements.txt
# Test and build the docs (Optional)
$ pytest -v && (cd docs; make html; cd ..)
```

To exit the virtual environment use the 'deactivate' script.

```sh
# Posix shells
$ deactivate
# cmd.exe
C:\> deactivate.bat
# PowerShell
PS C:\> Deactivate.ps1
```

### Running

```sh
# Ensure the virtual environment is activated
$ source venv/bin/activate
# Run with python
$ python run.py
```
