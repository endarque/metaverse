from flask import session
from flask_socketio import emit, join_room, leave_room, Namespace


# 클래스 기반 Namespace
class ChatNamepsace(Namespace):

    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_joined(self, data):
        print("입장~!!!");
        room = session.get('room')
        name = session.get('name')
        join_room(room)
        emit('status', {'msg': session.get('name') + '님이 입장하셨습니다.', 'room': session.get('room')}, room=room, name=name)

    def on_text(self, data):
        room = session.get('room')
        name = session.get('name')
        emit('message', {'msg': session.get('name') +' : ' + data['msg']}, room=room, name=name)

    def on_left(self, data):
        room = session.get('room')
        leave_room(room)
        emit('status', {'msg': session.get('name') + '님이 퇴장하셨습니다.'}, room=room)


# 데코레이터 함수 기반 Namespace
def socketio_init(socketio):
    @socketio.on('joined', namespace='/demo2')
    def joined(message):
        room = session.get('room')
        name = session.get('name')
        join_room(room)
        emit('status', {'msg': session.get('name') + '님이 입장하셨습니다.', 'room': session.get('room')}, room=room, name=name)


    @socketio.on('text', namespace='/demo2')
    def text(message):
        room = session.get('room')
        emit('message', {'msg': session.get('name') + ' : ' + message['msg']}, room=room)


    @socketio.on('left', namespace='/demo2')
    def left(message):
        room = session.get('room')
        leave_room(room)
        emit('status', {'msg': session.get('name') + '님이 퇴장하셨습니다.'}, room=room)



