import threading


class ConditionObject:
    """ Conditions which govern playback in """
    lock = threading.Lock() 	#: threading Lock Object
    play = True		#: if playing
    pause = False  # : if paused
    done = False  # : if playback completed

    def toggle_pause(self):
        """ flip pause condition """
        self.pause = not self.pause