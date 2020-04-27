from asteroid.main.player.PlayStream import PlayStream
from asteroid.main.player.ConditionObject import ConditionObject
import threading
from pymongo import MongoClient
import os

class AudioHandler(threading.Thread):
    """ Audio wrapping thread for controlling player daemons """

    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue
        self.daemon = True
        self.current_player = None
        self.condObj = ConditionObject()
        self.first = True         # hacky, since first call must be over socket msg

        self.mongo = MongoClient("mongodb://192.168.0.12:27017/asteroid")
        self.db = self.mongo.get_database('asteroid')

    def run(self):
        """ main loop; checks if new message has been received or if playback is complete """
        while True:
            try:
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

    def _get_latest_from_queue(self):
        """ if latest queue item exists, removes it """
        try:
            item = self.db.queue.find({}).sort('vote', -1).limit(1).next()
        except StopIteration as e:
            item = None
        except Exception as e:
            print(e)
            item = None
        else:
            self.db.queue.remove(item.get('_id'))
        finally:
            return item

    def get_path_from_database(self):
        """ get latest song from song queue; remove song from song queue if exists and return song path, else None """
        item = self._get_latest_from_queue()
        if item is not None and item.get('vote') > 0:
            return item.get('song').get('file_path')
        return None

    def play(self, *args):
        """ play song """
        if len(args) == 2:
            path = args[1]
        else:
            path = self.get_path_from_database()

        if path is None or not os.path.isfile(path):
            print("DEBUG -- file does not exist", path)
            return

        if self.current_player != None:
            self.stop()

        player = PlayStream(self.condObj)
        player.loadsong(path)
        player.start()
        self.current_player = player
        self.first = False

    def resume(self, *args):
        self.first = True

    def pause(self, *args):
        with self.condObj.lock:
            self.condObj.toggle_pause()

    def stop(self, *args):
        with self.condObj.lock:
            self.condObj.play = False
        self.condObj = ConditionObject()
        self.current_player = None
