from flask import jsonify

class Vote:
	def __init__(self, request):
		self.request = request
		self.form = request.form

	def handle_vote(self, u_id, s_id, vote):
		pass

	def get_votes():
		pass

	def __call__(self):
		print(self.form)
		return "TODO\n"