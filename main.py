import urllib.parse

# Example data from your JSON
movie_name = "You're a Good Sport, Charlie Brown"
torrent_hash = "93739DEB9F0E5D9A30B930F080B7E74DE0874B5C"

# Trackers you recommended
trackers = [
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.openbittorrent.com:80"
]

# URL Encode the movie name
encoded_name = urllib.parse.quote_plus(movie_name)

# Construct the Magnet URL
tracker_params = "".join([f"&tr={urllib.parse.quote(t)}" for t in trackers])
magnet_link = f"magnet:?xt=urn:btih:{torrent_hash}&dn={encoded_name}{tracker_params}"

print(magnet_link)
