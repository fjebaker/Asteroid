import threading

class ConditionObject:
	'''
	Conditions which govern playback in :class:`PlayStream`
	'''
	lock = threading.Lock() 	#: threading Lock Object
	play = True		#: if playing
	pause = False	#: if paused
	done = False	#: if playback completed