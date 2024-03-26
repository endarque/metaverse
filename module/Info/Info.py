@app.route('/api/room')
def rooms():
    return {'lobbies': [lobby.to_dict() for lobby in lobbies]}


@app.route('/api/lobby/<id>', methods=['GET', 'PUT'])
def room(id):
    lobby = Lobby.query.get(id)
    lob = lobby.to_dict()
    if request.method == 'PUT':
        if len(lob['players']) >= lob['player_max']:
            return False
        userId = json.loads(request.json)['id']
        user = User.query.get(userId)
        lobby.users.append(user)
        db.session.commit()
    return lob