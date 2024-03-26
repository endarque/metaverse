from flask import request
from flask_socketio import Namespace, emit, join_room, leave_room, rooms
import numpy as np
import base64, cv2

class webCam(Namespace):

    def __init__(self, namespace):
        super(Namespace, self).__init__(namespace)

        self.namespace = namespace
        self.roomName = "test_webChatRoom"
        self.userList = []
        return

    def on_connect(self):
        print("Socket Connected")
        emit("connectionSuccess", {'data': 'success'})
        return

    def on_disconnect(self):
        print('test_auto')
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
        isTeacher = data['is_teacher']

        # teacher 중복 입장 방지
        if isTeacher:
            for user in self.userList:
                if user['room'] == room and user['is_teacher'] is True:
                    emit("teacherIsAlreadyExists")
                    return

        roomUserList = []
        for user in self.userList:
            if user['room'] == room and user['is_teacher'] is False:
                roomUserList.append(user)

        emit("userIdReturn",
             {"socketId": currentSocketId, "room": room, "userList": roomUserList,
              "data": "Connected"})

        newUser = {
                'id': len(roomUserList),
                'socketId': currentSocketId,
                'room': room,
                'is_teacher': isTeacher
            }
        self.userList.append(newUser)

        join_room(room)
        emit("userConnect", {"user": newUser, "data": "Connected"},
             broadcast=True, to=room)
        return

    def on_cam(self, data):
        userSocketId = data['socketId']
        room = data['room']
        cam = data['data']
        # Decode the base64-encoded image data
        image = self.base64_to_image(cam)

        frame_resized = cv2.resize(image, (320, 240))

        # Encode the processed image as a JPEG-encoded base64 string
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 90]
        result, frame_encoded = cv2.imencode(".jpg", frame_resized, encode_param)
        processed_img_data = base64.b64encode(frame_encoded).decode()

        # Prepend the base64-encoded string with the data URL prefix
        b64_src = "data:image/jpg;base64,"
        processed_img_data = b64_src + processed_img_data

        # Send the processed image back to the client
        isTeacher = False
        for user in self.userList:
            if user['socketId'] == userSocketId and user['is_teacher'] is True:
                isTeacher = True
                break

        if isTeacher:
            # if user is teacher send teacherCam
            emit("teacherCam", processed_img_data, broadcast=True, to=room)
        else:
            # else send studentCams
            emit("studentCams", {'socketId': userSocketId, 'image': processed_img_data}, broadcast=True, to=room)
        return

    def on_chat(self, data):
        currentSocketId = request.sid
        room = data['room']
        for user in self.userList:
            if user['room'] == room and user['socketId'] == currentSocketId:
                emit('chatMsg', {'user': user, 'msg': data['msg']}, broadcast=True, to=room)


    def on_cameraOn(self, data):
        currentSocketId = request.sid
        room = data['room']
        emit('cameraOn', {'socketId': currentSocketId}, broadcast=True, to=room)
        return

    def on_cameraOff(self, data):
        currentSocketId = request.sid
        room = data['room']
        for user in self.userList:
            if user['room'] == room and user['socketId'] == currentSocketId:
                emit('cameraOff', {'user': user}, broadcast=True, to=room)
        return

    def base64_to_image(self, base64_string):
        # Extract the base64 encoded binary data from the input string
        base64_data = base64_string.split(",")[1]
        # Decode the base64 data to bytes
        image_bytes = base64.b64decode(base64_data)
        # Convert the bytes to numpy array
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        # Decode the numpy array as an image using OpenCV
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        return image