import sqlite3
import functools

def sanatise(func):
    def iterate(args):
        a_type = type(args)
        s_args = []
        for arg in args:
            if type(arg) == tuple:
                arg = tuple(iterate(arg))
            elif type(arg) == list:
                arg = list(iterate(arg))
            elif type(arg) == str:
                arg = arg.replace("'", "''").replace('"', '""')
            s_args.append(arg)
        return a_type(s_args)

    def dedict(arg):
        res = {}
        for i, j in arg.items():
            if type(j) == str:
                j = j.replace("''", "'").replace('""', '"')
            res[i] = j
        return res

    def desanit(args):
        if args == None:
            return None
        a_type = type(args)
        s_args = []
        for arg in args:
            if type(arg) == tuple:
                arg = tuple(iterate(arg))
            elif type(arg) == list:
                arg = list(iterate(arg))
            if type(arg) == dict:
                arg = dedict(arg)
            elif type(arg) == str:
                arg = arg.replace("''", "'").replace('""', '"')
            s_args.append(arg)
        return a_type(s_args)


    @functools.wraps(func)
    def _sanatise(cls, *args):
        # print("DEBUG unsanatised ", args)
        s_args = iterate(args)
        # print("DEBUG sanatised", s_args)
        return desanit(func(cls, *s_args))
    return _sanatise

class DBInstance:
    """
    TODO
    """
    def __init__(self, location):
        if location != ":memory:" and ".db" != location[-3:]:
            raise Exception("Not a valid string format.")
        self.location = location

    def open(self):
        """
        TODO
        """
        return self.__enter__()

    def close(self):
        """
        TODO
        """
        self.__exit__()

    def __call__(self, keys):
        if type(keys) != tuple:
            raise Exception("Keys are not tuple.")
        else:
            self.keys = keys
        return self.__enter__()

    def __enter__(self):
        try:
            self.handle = sqlite3.connect(self.location)
        except Exception as e:
            raise Exception("Could not connect to handle '{}' : {}".format(self.handle, str(e)))
        else:
            self.cursor = self.handle.cursor()
        return self

    def __exit__(self, *args, **kwargs):
        self._save()
        self.handle.close()

    def create_table(self, table_name, types=(), additional=""):
        """
        TODO

        :param table_name:
        :param types:
        """
        if len(self.keys) != len(types):
            raise Exception("Wrong number of types specified for keys {}.".format(self.keys))
        column_type = ", ".join([i + " " + j for i, j in zip(self.keys, types)])
        self.cursor.execute('''CREATE TABLE %s (%s %s);''' % (table_name, column_type, additional))

    def insert_entire_row(self, table_name, data):
        """
        TODO

        :param table_name:
        :param data:
        """
        if len(data) != len(self.keys):
            raise Exception("Wrong number of values for keys {}.".format(self.keys))
        columns = ", ".join(self.keys)
        data = [str(i) for i in data]
        values = str(data)[1:-1]
        # print('''INSERT INTO %s (%s) VALUES (%s);''' % (table_name, columns, values))
        self.cursor.execute('''INSERT INTO %s (%s) VALUES (%s);''' % (table_name, columns, values))

    def select_rows(self, table_name, what, where, orderlimit="ORDER BY rowid ASC", like=False, inlist=False):
        """
        TODO

        :param table_name:
        :param what:
        :param where:
        :param orderlimit:
        :param like:
        :param inlist:
        :return:
        """
        cond = "%s = '%s'"
        if like:
            cond = "%s LIKE '%%%s%%'"
        if inlist:
            cond = "%s IN (%s)"
        keys = ("rowid",) + self.keys
        where_s = ", ".join([cond % (keys[i], str(j)) for i, j in where.items()])
        what_s = ", ".join(what)
        # print('''SELECT %s FROM %s WHERE %s %s''' % (what_s, table_name, where_s, orderlimit))
        ret = self.cursor.execute('''SELECT %s FROM %s WHERE %s %s;''' % (what_s, table_name, where_s, orderlimit))
        return self._sort(ret, what)

    def select_columns(self, table_name, column_list):
        """
        select whole column from table

        :param table_name: name of table
        :type table_name: str
        :param column: name of column to select from
        :type column: str/tuple[str]
        :returns: tuple of tuples with items from column [(x1, y1, ...), (x2, y2, ...), ...]
        """
        if type(column_list) != tuple:
            column_list = (column_list,)
        cols = ", ".join(column_list)
        # print('''SELECT {} from {}'''.format(cols, table_name))
        return tuple(self.cursor.execute('''SELECT %s FROM %s ORDER BY rowid ASC;''' % (cols, table_name)).fetchall())

    def get_n_latest_rows(self, table_name, n):
        """
        TODO

        :param table_name:
        :param n:
        :param startingrowid:
        :return:
        """
        return self.select_rows(table_name, ("rowid", "*"),
                {0:""}, like=True, orderlimit="ORDER BY rowid DESC LIMIT %s" % str(n))

    def get_all_rows(self, table_name):
        """
        TODO

        :param table_name:
        :return:
        """
        return self.select_rows(table_name, ("rowid", "*"),
                {0:""}, like=True)

    def update_generic(self, table_name, changes, condition):
        """
        update entries according to condition in the database

        :param table_name: name of the table to update
        :type table_name: str
        :param changes: changes to enact e.g. `{col1:value1, ...}`
        :type changes: dict
        :param condition: the condition to be met to qualify for changes e.g. `{col3:value3}`
        :type condition: dict

        TODO check the changes fit the table
        """

        keys = ("rowid",) + self.keys
        cond = "%s = '%s'"
        changes_string = ", ".join([cond % (keys[i], str(j)) for i, j in changes.items()])
        condition_string = "".join([cond % (keys[i], str(j)) for i, j in condition.items()])
        # print('''UPDATE %s SET %s WHERE %s''' % (table_name, changes_string, condition_string))
        self.cursor.execute('''UPDATE %s SET %s WHERE %s''' % (table_name, changes_string, condition_string))

    def delete_rows(self, table_name, condition):
        """
        TODO

        :param table_name:
        :param condition:
        :return:
        """
        keys = ("rowid",) + self.keys
        cond = "%s = '%s'"
        condition_string = "".join([cond % (keys[i], str(j)) for i, j in condition.items()])
        # print('''DELETE FROM {} WHERE {}'''.format(table_name, condition_string))
        self.cursor.execute('''DELETE FROM %s WHERE %s''' % (table_name, condition_string))

    def get_count(self, table_name):
        """
        TODO
        """
        return self.select_rows(table_name, ("rowid",), {0:""}, like=True, orderlimit="ORDER BY rowid DESC LIMIT 1")[0]["rowid"]

    def _save(self):
        """
        internal method for commiting changes to the database
        """
        self.handle.commit()

    def _sort(self, vals, keys=()):
        """
        TODO
        :param vals:
        :param keys:
        :return:
        """
        if keys == ():
            keys = self.keys

        # expand wildcard
        elif "*" in keys:
            keys = list(keys)
            i = keys.index("*"); del keys[i]
            for k in reversed(self.keys):
                keys.insert(i, k)

        # sort and return
        ret_l = []
        for obj in vals:
            ret = {}
            for key, val in zip(keys, obj):
                ret[key] = val
            ret_l.append(ret)
        return tuple(ret_l)

class DBAccessory(type):
    """
    Metaclass for the Database classes :class:`MusicDB` and :class:`UserDB`.
    Will wrap all non-special functions with a decorator, providing a scoped instance of :class:`DBInstance`.
    """

    def __new__(cls, name, bases, local):
        for attr in local:
            value = local[attr]
            if "__" in attr:
                continue
            if callable(value):
                local[attr] = DBAccessory.deco(value)
        return type.__new__(cls, name, bases, local)

    @classmethod
    def deco(cls, func):
        """
        Decorator which calls function with scoped :class:`DBInstance` in the class dict

        :param func: function to decorate
        :type func: function reference
        """

        def wrapper(*args, **kwargs):
            inst = args[0]  # class instance
            with DBInstance(inst.db_handle)(inst.keys) as inst.db_inst:
                result = func(*args, **kwargs)
            return result

        return wrapper


class MusicDB(metaclass=DBAccessory):
    """
    Provides methods for interacting with the music database.
    Encapsulates :class:`DBInstance`

    Assumes database already has a table with format

        songs

        name, artist, duration, file_path, meta_dat

    :param db_handle: sqlite database handle
    :type db_handle: str
    """
    keys = ("name", "artist", "duration", "file_path", "meta_dat")
    k_type = ("text", "text", "real", "text", "text")

    def __init__(self, db_handle):
        self.db_handle = db_handle

    def create_table(self):
        """
        TODO
        """
        self.db_inst.create_table("songs", self.k_type,
                additional=", CONSTRAINT id_unique UNIQUE (file_path)")

    @sanatise
    def add_song(self, song):
        """
        TODO

        :param song:
        """
        self.db_inst.insert_entire_row("songs", song)

    @sanatise
    def get_by_name(self, name):
        """
        TODO
        """
        return self.db_inst.select_rows("songs", {"rowid", "*"}, {1:name}, like=True)

    @sanatise
    def get_by_artist(self, artist):
        """
        TODO
        """
        return self.db_inst.select_rows("songs", {"rowid", "*"}, {2:artist}, like=True)

    @sanatise
    def get_by_rowid(self, *args):
        """
        Get song by id.

        :param str rowids: database table ``rowid`` to return whole row from.
        :returns: song with ``rowid``
        :rtype: length 1 tuple of tuple
        """
        islist = len(args) > 1
        rowids = ", ".join([str(i) for i in args])
        return self.db_inst.select_rows("songs", ("rowid", "*"), {0:rowids}, inlist=islist)

    @sanatise
    def get_page(self):
        """
        TODO
        """
        return self.db_inst.get_n_latest_rows("songs", 50)

    @sanatise
    def get_all_songs(self):
        """
        Returns all songs in database given in constructor.

        :returns: all rows of ``songs`` table in database.
        :rtype: tuple of tuples
        """
        return self.db_inst.get_all_rows("songs")


class UserDB(metaclass=DBAccessory):
    """
    Provides methods for interacting with the static user database.
    Encapsulates :class:`DBInstance`

    Assumes database already has a table with format

        users

        id, name, hash_pw, meta_dat

    :param db_handle: sqlite database handle
    :type db_handle: str
    """

    keys = ("id", "name", "hash_pw", "meta_dat")
    k_type = ("int", "text", "int", "text")

    def __init__(self, db_handle):
        self.db_handle = db_handle

    def create_table(self):
        """
        TODO
        """
        self.db_inst.create_table("users", self.k_type,
            additional=", CONSTRAINT path_unique UNIQUE (id)")

    @sanatise
    def add_user(self, user):
        self.db_inst.insert_entire_row("users", user)

    @sanatise
    def get_by_id(self, id_n):
        """
        Get user by id.

        :param int id_n: ``users`` table column ``id`` to match and return whole row from.
        :returns: user with ``id==id_n``
        :rtype: length 1 tuple of tuple
        """
        return self.db_inst.select_rows("users", ("*",), {1:id_n})

    @sanatise
    def get_all_users(self):
        """
        Returns all users in database given in constructor.

        :returns: all rows of ``users`` table in database.
        :rtype: tuple of tuples
        """
        return self.db_inst.get_all_rows("users")

    @sanatise
    def get_latest_user(self):
        """
        TODO

        assumes no users ever removed (update in future?)
        :return:
        """
        return self.db_inst.get_n_latest_rows("users", 1)

if __name__ == '__main__':
    pass
