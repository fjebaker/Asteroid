import pyaudio
import wave
import sys
import struct
import threading
import time
import functools


def restrict_call(function):
    """
    Decorator applied to prevent additional function calls.
    If a second call is attempted to the function, exception is raised.

    :raise: Exception: "Attempted to call function.__name__ twice."
    """
    function.called = False

    @functools.wraps(function)
    def _restricted(*args, **kwargs):
        if not function.called:
            function.called = True
            return function(*args, **kwargs)
        else:
            raise Exception(
                "Attempt to call '{}' twice.".format(function.__name__))
    return _restricted


class PlayStream(threading.Thread):
    """ audio playback thread """

    chunk = 1024

    def __init__(self, condition_object):
        self.CO = condition_object
        threading.Thread.__init__(self)
        self.deamon = True
        self._p = pyaudio.PyAudio()
        self._format = {}

    def loadsong(self, song):
        """ load in information about the song for setting up audio stream """
        prop = {}
        self._song = song
        with wave.open(song, 'rb') as wf:
            prop['rate'] = wf.getframerate()
            prop['format'] = self._p.get_format_from_width(wf.getsampwidth())
            prop['channels'] = wf.getnchannels()
            prop['output'] = True
        self._format = prop


    def run(self):
        """ thread start method """
        self._play()

        with self.CO.lock:
            self.CO.done = True


    def _play(self):
        """ begin audio playback, controlled by the condition object """
        with self.CO.lock:
            play = self.CO.play
            paused = self.CO.pause

        stream = self._p.open(**self._format)
        with wave.open(self._song, 'rb') as wf, self._p.open(**self._format) as stream: 
            data = wf.readframes(self.chunk)

            while len(data) > 0 and play:
                if not paused:
                    stream.write(data)
                    data = wf.readframes(self.chunk)
                else:
                    time.sleep(0.2)
                with self.CO.lock:
                        play = self.CO.play
                        paused = self.CO.pause

            stream.stop_stream()