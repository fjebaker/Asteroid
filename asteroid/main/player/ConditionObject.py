import threading


class ConditionObject:
    '''
    Conditions which govern playback in :class:`src.main.python.player.PlayStream`
    '''
    lock = threading.Lock() 	#: threading Lock Object
    play = True		#: if playing
    pause = False  # : if paused
    done = False  # : if playback completed

    def toggle_pause(self):
        """
        Toggle :attr:`self.pause`

                if ``self.pause == True``: set to ``False``

                if ``self.pause == False``: set to ``True``
        """
        self.pause = not self.pause
