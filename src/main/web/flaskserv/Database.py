from src.main.web.flaskserv._Tables import User, Song, SItem, dBase, HItem
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker
from src.main.databasebuilder.setupfuncs import db_path


def init_database_session():
    global engine, Session
    try:
        del Session
        del engine
    except:
        pass
    engine = create_engine('sqlite:///{}'.format(db_path()), echo=False)
    dBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

class MusicDB():

    def __init__(self):
        self.session = Session()

    def add_song(self, song):
        self.session.add(Song(**song))
        try:
            self.session.commit()
        except IntegrityError as err:
            self.session.rollback()
            raise Exception("'file_path' uniqueness condition failed.")


    def get_by_name(self, name):
        return self.session.query(Song).filter(Song.name.like('%{}%'.format(name))).limit(40).all()

    def get_by_artist(self, artist):
        return self.session.query(Song).filter(Song.artist.like('%{}%'.format(artist))).limit(40).all()

    def get_by_name_and_artist(self, name, artist):
        return self.session.query(Song).filter(
                Song.name.like('%{}%'.format(name)),
                Song.artist.like('%{}%'.format(artist))
            ).limit(40).all()

    def get_by_id(self, *args):
        return self.session.query(Song).filter(
                Song.id.in_(args)
            ).limit(40).all()

    def get_page(self):
        return self.session.query(Song).order_by(Song.id.desc()).limit(40).all()

    def get_all_songs(self):
        return self.session.query(Song).all()

    def __del__(self):
        self.session.close()


class UserDB():

    def __init__(self):
        self.session = Session()

    def add_user(self, user):
        self.session.add(User(**user))
        self.session.commit()

    def get_by_id(self, *args):
        return self.session.query(User).filter(
                User.id.in_(args)
            ).limit(40).all()

    def get_all_users(self):
        return self.session.query(User).all()

    def get_latest_user(self):
        return self.session.query(User).order_by(User.id.desc()).first()

    def __del__(self):
        self.session.close()

class Playlist():

    def __init__(self):
        self.session = Session()

    def add(self, item):
        self.session.add(SItem(**item))
        self.session.commit()

    def get_playlist(self):
        return self.session.query(SItem).all()

    def update_vote(self, s_id, vote):
        self.session.query(SItem).filter(SItem.s_id == s_id).update(
                {SItem.vote : vote + SItem.vote}, synchronize_session = False
            )
        self.session.commit()

    def get_most_voted(self):
        return self.session.query(SItem).order_by(SItem.vote.desc()).first()

    def remove(self, s_id):
        self.session.query(SItem).filter(SItem.s_id == s_id).delete()
        self.session.commit()

    def __del__(self):
        self.session.close()

class History():

    def __init__(self):
        self.session = Session()

    def add(self, item):
        self.session.add(HItem(**item))
        self.session.commit()

    def get_current_song(self):
        return self.session.query(HItem).order_by(HItem.id.desc()).first()

    def __del__(self):
        self.session.close()