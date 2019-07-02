from src.main.player.PlayStream import PlayStream
from src.main.player.ConditionObject import ConditionObject
from src.main.web.flaskserv import Playlist, History
from src.main.web.flaskserv import MusicDB
from queue import Queue
import threading
import os
from src.main.databasebuilder.setupfuncs import music_db_path, playlist_db_path


class AudioHandler(threading.Thread):
    """
    Controlls how the music is being played. Will spawn instances of :class:`src.main.python.player.PlayStream` for each song.
    Handles the :class:`src.main.python.player.ConditionObject` in response to INET server commands.
    Determines playback from the music database also handles by the HTTP server.
    Has ``self.daemon = True``.

    :param queue: queue to get new INET server commands.
    :type queue: :class:`queue.Queue`
    """

    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue
        self.out_queue = Queue()
        self.daemon = True
        self.current_player = None
        self.condObj = ConditionObject()

        self.first = True         # hacky, since first call must be over socket msg

    def run(self):
        '''
        Inherited and overwritten :meth:`threading.Thread.run`; called when :attr:`self.start()` method is invoked.
        Checks if a new message has been received in :attr:`self.queue`, and if so, acts upon it.
        Else, checks if current playback has finished, i.e. ``ConditionObject.done == True``,
        in which case tries to fetch a new item from the ``playlist`` table in the database, and if one exists,
        will play most voted song.
        '''
        while True:
            try:
                # print("WAITING FOR MESSAGE")
                msg = self.queue.get(timeout=0.5)
            except:
                play = False
                with self.condObj.lock:
                    if self.condObj.done or self.first:
                        play = True
                if play:
                    self.play()
            else:
                print("DEBUG -- got message : ", msg)
                self.__getattribute__(msg[0])(*msg)

    def get_path_from_database(self):
        """
        Queries the ``songs`` table with :class:`src.main.python.flaskserv.Database.MusicDB` to determine
        information on the next song to play given the song id from :meth:`self.fetch_playlist_item`.

        :returns: the path to the most voted song
        :rtype: str
        """
        pl = Playlist(playlist_db_path())
        n_item = pl.get_most_voted()
        if n_item == ():
            # TODO
            return None

        n_item = n_item[0]
        s_id = n_item["s_id"]
        pl.remove(s_id)
        History(playlist_db_path()).add((n_item["s_id"], n_item["u_id"], n_item["vote"]))

        try:
            song = MusicDB(music_db_path()).get_by_rowid(s_id)[0]
        except Exception as e:
            print("DEBUG -- get_path_from_database :: Exception = " + str(e))
            return None
        else:
            return song["file_path"]

    def play(self, *args):
        """
        Begin the playback -- first checks if ``*args`` contains a path, else calls :meth:`self.get_path_from_database`
        to fetch a song path. Then checks if the file exists, returns ``None`` if false. Stops the current playback if a player
        exists by calling :meth:`self.stop`. Creates a new :class:`src.main.python.player.PlayStream` instance, loads the song
        and starts the playback. Finally, sets :attr:`self.curret_player` to new instance.
        """
        if len(args) == 2:
            path = args[1]
        else:
            path = self.get_path_from_database()
            if path == None:
                return
            # check file exists
        if not os.path.isfile(path):
            # print("DEBUG -- file does not exist", path)
            return

        if self.current_player != None:
            self.stop()

        player = PlayStream(self.condObj, self.out_queue)
        player.loadsong(path)
        player.start()
        self.current_player = player
        self.first = False

    def resume(self, *args):
        """
        TODO
        """
        self.first = True

    def pause(self, *args):
        """
        Pause the playback -- calls :meth:`src.main.python.player.ConditionObject.toggle_pause` on own instance.
        """
        with self.condObj.lock:
            self.condObj.toggle_pause()

    def stop(self, *args):
        """
        Sets the current instace of :attr:`src.main.python.player.ConditionObject.play` to ``False``, then spawns fresh instance
        and sets :attr:`self.current_player` to ``None``.
        """
        with self.condObj.lock:
            self.condObj.play = False
        self.condObj = ConditionObject()
        self.current_player = None
