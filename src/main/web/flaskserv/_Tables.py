from sqlalchemy import String, Integer, Float, Column
from sqlalchemy.ext.declarative import declarative_base


dBase = declarative_base()


class Song(dBase):
    __tablename__= 'songs'

    id = Column(Integer, primary_key=True)
    name = Column(String)
    artist = Column(String)
    duration = Column(Float)
    file_path = Column(String, unique=True)
    meta_dat = Column(String)

    def format(self):
        return {
            'id': self.id,
            'name': self.name,
            'artist': self.artist,
            'duration': self.duration,
            'meta_dat': self.meta_dat
        }


class User(dBase):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    hash_pw = Column(Integer)
    meta_dat = Column(String)

    def format(self):
        return {
            'id': self.id,
            'name': self.name,
            'meta_dat': self.meta_dat
        }


# SongItem for the Playlist
class SItem(dBase):
    __tablename__ = 'playlist'

    id = Column(Integer, primary_key=True)
    s_id = Column(Integer)
    u_id = Column(Integer)
    vote = Column(Integer)

    def format(self):
        return {
            's_id': self.s_id,
            'u_id': self.u_id,
            'vote': self.vote
        }

# HistoryItem for the History table
class HItem(dBase):
    __tablename__ = 'history'

    id = Column(Integer, primary_key=True)
    s_id = Column(Integer)
    u_id = Column(Integer)
    vote = Column(Integer)

    def format(self):
        return {
            'id': self.id,
            's_id': self.s_id,
            'u_id': self.u_id,
            'vote': self.vote
        }