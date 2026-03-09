# Add these endpoints to stream_server.py

@app.route('/api/watchlist/<movie_id>', methods=['POST'])
def add_to_watchlist(movie_id):
    session_id = request.args.get('session_id', 'default')
    db.add_to_watchlist(int(movie_id), session_id)
    return jsonify({'success': True})

@app.route('/api/watchlist/<movie_id>', methods=['DELETE'])
def remove_from_watchlist(movie_id):
    session_id = request.args.get('session_id', 'default')
    db.remove_from_watchlist(int(movie_id), session_id)
    return jsonify({'success': True})

@app.route('/api/watchlist')
def get_watchlist():
    session_id = request.args.get('session_id', 'default')
    watchlist = db.get_watchlist(session_id)
    return jsonify({'watchlist': watchlist})
