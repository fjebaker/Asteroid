"""Handle users requests for new songs."""
import requests
import flask
import pydub
import os
from src.main.web.flaskserv.Database import MusicDB
import subprocess

def get(url, type, music_path='src/main/music/', format='wav'):
    """Add the audio file at the url to the server.

    :param url: url of the song to be downloaded
    :type url: str
    :raises requests.exceptions.MissingSchema: URL is invalid
    :raises requests.exceptions.ConnectionError: Failed to connect to URL
    :raises TypeError: URL is not an audio file
    """
    if (type == "url"):
        song_name = url.rsplit('/', 1)[-1]
        song_path = "".join([music_path, song_name])
        response = requests.get(url)
        mime_type = response.headers['Content-Type']
        if 'audio' not in mime_type:
            return 415
        with open(song_path, 'wb') as file:
            file.write(response.content)
        new_song_path = ".".join([song_path.rsplit('.', 1)[0], format])
        segment = pydub.AudioSegment.from_file(song_path)
        segment.export(new_song_path,format=format)
        os.remove(song_path)
        song_dict = {"name":song_name.rsplit('.',1)[0],"artist":"Unknown","duration":len(segment)/1000,"file_path":new_song_path,"meta_dat":""}
        #Try to work out song name and artist
        split_title = []
        if " - " in song_dict["name"]:
            split_title = song_dict["name"].split(" - ")
        elif " ~ " in song_dict["name"]:
            split_title = song_dict["name"].split(" ~ ")
        if len(split_title) == 2:
            song_dict["name"] = split_title[1].strip(" ")
            song_dict["artist"] = split_title[0].strip(" ")
        dbinst = MusicDB()
        dbinst.add_song(song_dict)
        return 201
    elif (type == "yt") :
        process = subprocess.Popen('python2.7 ~/Documents/PyTubeForAsty/run.py "{}"'.format(url),shell=True,stdin=None,stdout=subprocess.PIPE,stderr=None)
        listenBool = False
        while (process.poll() is None):
            out,err = process.communicate()
            out = out.decode()
            if ("LISTEN::" in out):
                listenBool = True
            if listenBool:
                if ("Song already exists!" in out):
                    process.kill()
                    return 409
                if ("Song is too long!" in out):
                    process.kill()
                    return 413
            if ("UNHEAR::" in out):
                listenBool = False
        return 201
    else:
        return 400

def handle(request):
    """Handle a new song request.

    :param request: The flask request containing the url in a json body
    :type request: werkzeug.local.LocalProxy
    :return: HTTP status code: `201` if website exists, `400` if website
    doesn't exist or is invalid, otherwise `500`
    :rtype: flask.Response
    """
    status = 500
    try:
        body = request.form
        if not isinstance(body, dict):
            return flask.Response(status=400)
        url = body['url']
        if not isinstance(url, str):
            return flask.Response(status=400)
        type = body['type']
        if not isinstance(type, str):
            return flask.Response(status=400)
        status = get(url,type)
    except TypeError as e:
        status = 400
    except FileNotFoundError as e:
        status = 400
    except requests.exceptions.MissingSchema as e:
        print("{e}: '{url}' is an invalid URL".format(e=e, url=url))
        status = 400
    except requests.exceptions.ConnectionError as e:
        print("{e}: Failed to connect to '{url}'".format(e=e, url=url))
        status = 400
    return flask.Response(status=status)
