from flask import request
from flask_socketio import Namespace, emit, join_room, leave_room, rooms
import numpy as np
import base64, cv2

class socketRoom(Namespace):

    def __init__(self, namespace):
        super(Namespace, self).__init__(namespace)

        self.namespace = namespace
        self.roomName = "test_phaserRoom"
        self.userList = []
        return

    def on_connect(self):
        print("Socket Connected")
        emit("connectionSuccess", {'data': 'success'})
        return

    def on_disconnect(self):
        currentSocketId = request.sid

        for user in self.userList:
            if user['socketId'] == currentSocketId:
                room = user['room']
                leaveUser = user
                self.userList.remove(user)

                leave_room(room)
                print('Client disconnected')
                emit("userLeave", {"user": leaveUser, "data": "Leaved"}, broadcast=True, to=room)


    def on_joinRoom(self, data):
        currentSocketId = request.sid
        room = data['room']
        name = data['name']
        texture = data['texture']
        isOwner = data['owner']

        # teacher 중복 입장 방지
        if isOwner:
            for user in self.userList:
                if user['room'] == room and user['owner'] is True:
                    emit("teacherIsAlreadyExists")
                    return

        roomUserList = []
        for user in self.userList:
            if user['room'] == room and user['owner'] is False:
                roomUserList.append(user)

        newUser = {
                'id': len(roomUserList),
                'name': name,
                'socketId': currentSocketId,
                'room': room,
                'owner': isOwner,
                'texture': texture,
                'anim': '',
                'X': 500,
                'Y': 200
            }

        emit("userIdReturn", {"user": newUser, "userList": roomUserList})

        self.userList.append(newUser)

        join_room(room)
        emit("userConnect", {"user": newUser, "data": "Connected"}, broadcast=True, to=room)
        return

    def on_myPosition(self, data):
        currentSocketId = request.sid
        name = data['name']
        pos = data['position']
        room = data['room']
        anim = data['anim']

        # update my position
        for user in self.userList:
            if user['name'] == name and user['socketId'] == currentSocketId:
                user['X'] = pos[0]
                user['Y'] = pos[1]
                user['anim'] = anim

                emit("updateUserPosition", {"user": user}, broadcast=True, to=room)
        return

    def on_chat(self, data):
        currentSocketId = request.sid
        room = data['room']
        for user in self.userList:
            if user['room'] == room and user['socketId'] == currentSocketId:
                emit('chatMsg', {'user': user, 'msg': data['msg']}, broadcast=True, to=room)

        return
