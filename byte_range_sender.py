import mimetypes
import os
import re
from flask import request, Response

def send_file_ranged(file_path):
    size = os.path.getsize(file_path)
    mime, _ = mimetypes.guess_type(file_path)
    if not mime: mime = 'video/mp4'

    range_header = request.headers.get('Range', None)
    if not range_header:
        with open(file_path, 'rb') as f:
            data = f.read()
        return Response(data, 200, mimetype=mime, direct_passthrough=True)

    byte1, byte2 = 0, None
    m = re.search('(\d+)-(\d*)', range_header)
    g = m.groups()
    if g[0]: byte1 = int(g[0])
    if g[1]: byte2 = int(g[1])

    length = size - byte1
    if byte2 is not None:
        length = byte2 - byte1 + 1

    with open(file_path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data, 206, mimetype=mime, direct_passthrough=True)
    rv.headers.add('Content-Range', 'bytes {0}-{1}/{2}'.format(byte1, byte1 + length - 1, size))
    rv.headers.add('Accept-Ranges', 'bytes')
    return rv
