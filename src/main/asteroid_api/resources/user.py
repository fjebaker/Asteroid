from flask import request
from flask_restful import Resource, fields, marshal_with, reqparse

from src.main.asteroid_api.common.__database import mongo

mUser = {
    'name': fields.String,
    'u_id': fields.Integer,
}

# argument parser for registering new users
new_user_parser = reqparse.RequestParser()
new_user_parser.add_argument('name', required=True)

# argument parser for searching for users
search_user_parser = reqparse.RequestParser()
search_user_parser.add_argument('name')
search_user_parser.add_argument('u_id', type=int, location='args', action='append')


class UserDB(Resource):
    """ Class for handling interactions with fetching from the User database """

    @marshal_with(mUser)
    def get(self):
        """ GET endpoint; performs database query depending on the parsed arguments """
        args = search_user_parser.parse_args(strict=True)

        result = list(mongo.db.users.find(
            # HACKY
            {k:{'$in':v} if type(v) == list else v for k,v in args.items() if v is not None}
        ))
        return result


class UserRegister(Resource):
    """ Class for registering new users """
    template = {'u_id':-1, 'hash_pw':'', 'other':''}

    def post(self):
        """ POST endpoint; adds new user with incremental u_id """
        user = {**new_user_parser.parse_args(strict=True), **self.template}
        try: u_id = mongo.db.users.find() \
                .sort('_id', -1) \
                .limit(1) \
                .next() \
                .get('u_id') + 1
        except:
            u_id = 1
        user['u_id'] = u_id
        try:
            mongo.db.users.insert_one(user)
        except:
            return "BAD NAME", 400
        return {'u_id': u_id}


