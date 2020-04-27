import os
os.environ["ASTEROID_CONFIG_PATH"] = './config.ini'
import sys
import argparse
from asteroid.main.databasebuilder import Config, JSConfig
from asteroid.main import init as WEBinit

WEBapp = WEBinit("config.Prod")

from asteroid.main.databasebuilder.SetupBuild import configure_database, check_database_connection
HEADER = r"""     _       _                 _     _ 
    /_\  ___| |_ ___ _ __ ___ (_) __| |
   //_\\/ __| __/ _ \ '__/ _ \| |/ _` |
  /  _  \__ \ ||  __/ | | (_) | | (_| |
  \_/ \_/___/\__\___|_|  \___/|_|\__,_|
                  v0.0.0
               github.com/Moontemple/Asteroid
 developed by Fergus Baker, JR Mitchell, Sam Hollow, Ben Shellswell
"""

check_database_connection(WEBapp)
try:
    configure_database(WEBapp)
except:
    print("databases already configured (?)")

def run_flask(host="", port=""):
    cfg = Config()
    if host == "":
        host = cfg.get("FlaskServer", "hostname")
    if port == "":
        port = cfg.get("FlaskServer", "port")
    JSConfig.build(cfg._sections['JSConfig'])
    print("[*] Starting flask HTTP server...")
    WEBapp.run(host, port)


def run_player(host="", port=""):
    cfg = Config()
    if host == "":
        host = cfg.get("PlayerConfig", "hostname")
    if port == "":
        port = cfg.get("PlayerConfig", "port")

    if 'alsaaudio' in sys.modules:
        del sys.modules['alsaaudio']
    try:
        import alsaaudio
    except:
        from time import sleep
        print("[*] No package 'alsaaudio' found, creating a mock...")
        # mock alsaaudio
        module = type(sys)('alsaaudio')

        class MockStream:
            def setformat(self, *args, **kwargs):
                pass

            def setchannels(self, *args, **kwargs):
                pass

            def setrate(self, *args, **kwargs):
                pass

            def setperiodsize(self, *args, **kwargs):
                pass

            def write(self, *args, **kwargs):
                pass

        module.PCM = lambda a, b, c: MockStream()
        module.PCM_PLAYBACK = None
        module.PCM_NORMAL = None
        module.PCM_FORMAT_S16_LE = None
        sys.modules['alsaaudio'] = module
        print("[+] Mock 'alsaaudio' created!")
    else:
        print("[*] Package 'alsaaudio' found!")
    finally:
        print("[*] Starting player INET server...")
        os.environ["LISTENER_HOST"] = host
        os.environ["LISTENER_PORT"] = port
        from asteroid.main.player import Listener
        Listener().start()


class databases:

    @staticmethod
    def load(db, path):
        #if db == 'all':
        #    databases.build_all()
        if db == 'music':
            databases.build_music(path)

    @staticmethod
    def build_music(loc):
        print("[+] adding '{}' collection in '{}'...".format("songs", WEBapp.config['MONGO_URI']))
        from asteroid.main.databasebuilder import build_music
        build_music(loc, WEBapp)
        print("[*] Done building Music.")

    @staticmethod
    def build_all():
        print("\n[*] Building all tables in database...")
        #databases.build_music(None)

    @staticmethod
    def clear(database):
        """
        TODO
        at the moment just deletes the current database
        """
        #from asteroid.main.databasebuilder import clear
        print("\n[-] Deleting old database...")
        #clear('./test.db')


def run(args):
    try:
        args.which
    except AttributeError:
        print("Command not recognised.")
        return 0

    if args.which is 'flask':
        run_flask(args.host, args.port)

    elif args.which is 'player':
        run_player(args.host, args.port)

    elif args.which is 'database':
        if args.db not in ['all', 'music']:
            print("Database: '{}': no such database.".format(args.db))
            return 0

        if args.fresh:
            databases.clear(args.db)
            databases.build_all()

        if args.path is not None:
            databases.load(args.db, args.path)

        elif not args.fresh:
            print("Could not recognise a database command. Try running with '-h' for help.")

    else:
        # print(args)
        print("Arguments not recognised; try running with '-h'.")
        return 0


if __name__ == '__main__':
    # create argument parser
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawTextHelpFormatter
    )
    # allow for flask, player, database commands, so have added a subparser
    subparsers = parser.add_subparsers(help='''\
        'flask'     - start the flask server on 0.0.0.0:8080
        'player'    - start the INET server on 127.0.0.1:6666
        'database'  - configure the database

         use e.g. 'flask -h' to access help for a flask command''')

    # flask subparser
    parser_flask = subparsers.add_parser('flask',
                                         formatter_class=argparse.RawTextHelpFormatter)
    parser_flask.set_defaults(which='flask')

    parser_flask.add_argument('--host', dest='host', action='store', type=str,
                              default="",
                              help='host to start server on; overrides that in config.ini')

    parser_flask.add_argument('--port', dest='port', action='store', type=str,
                              default="",
                              help='host to start server on; overrides that in config.ini')

    # player subparser
    parser_player = subparsers.add_parser('player',
                                          formatter_class=argparse.RawTextHelpFormatter)
    parser_player.set_defaults(which='player')

    parser_player.add_argument('--host', dest='host', action='store', type=str,
                              default="",
                              help='host to start server on; overrides that in config.ini')

    parser_player.add_argument('--port', dest='port', action='store', type=str,
                              default="",
                              help='host to start server on; overrides that in config.ini')

    # database subparser
    parser_db = subparsers.add_parser('database',
                                      formatter_class=argparse.RawTextHelpFormatter)
    parser_db.set_defaults(which='database')

    parser_db.add_argument('db', action='store', nargs='?', default='all',
                           help="DEFAULT  - select all databases\n" +
                                "'music'  - select music database\n")

    parser_db.add_argument('--fresh', dest='fresh', action='store_const',
                           const=True, default=False,
                           help='clear the database')

    parser_db.add_argument('--load', dest='path', action='store', type=str,
                           help='load directory into database')

    # parse the command line args
    print(HEADER)
    args = parser.parse_args()
    # print(args)

    # start the program
    run(args)
