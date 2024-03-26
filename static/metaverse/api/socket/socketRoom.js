import { game } from '../../config/room.js'

$(document).ready(function () {

    const scene = game.scene.keys.MainLand;
    var myRoomName = '';
    var myName = '';
    var teacherIcon = '<i class="fa fa-fw fa-graduation-cap"></i>';
    var mySocketId = '';
    var prePos = [0 , 0];

    var socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port + '/socketRoom');
    socket.on('connect', function () {
        console.log("Connected...!", socket.connected)
    });

    socket.on('connectionSuccess', function() {
        myRoomName = info_room;
        myName = info_name;
        var texture = info_char;
        socket.emit('joinRoom', {'room': myRoomName, 'name': myName, 'texture': texture, 'owner': false })
    });

    // 내 캐릭터 접속 완료. 및 현재 들어와 있는 사용자 생성
    socket.on('userIdReturn', function(data) {
        // set my information
        var myData = data['user'];
        var userList = data['userList'];
        mySocketId = myData['socketId'];

        // 내 캐릭터 생성
        scene.createMyUser(myData['texture'], myName, 'KOSYAS', myData['X'], myData['Y']);

        // 지금까지 방에 들어와 있는 캐릭터 생성
        userList.forEach(function (user) {
            scene.createOtherUser(user['texture'], user['name'], 'KOSYAS', user['X'], user['Y'], user['anim']);
        });

        // FPS 30 으로 나의 위치 정보를 전송 한다. 내 위치가 변하지 않으면 보내지 않는다.
        const FPS = 15;
        setInterval(() => {
            var pos = scene.getMyCharPosition();
            if (prePos[0] != pos[0] || prePos[1] != pos[1]) {
                var anim = scene.getMyCharAnim();
                prePos = pos;
                var data = {'name': myName, 'position': pos, 'anim': anim, 'room': myRoomName};
                socket.emit('myPosition', data);
            }
        }, 1000 / FPS);
    });

    // 다른 사용자의 위치정보를 받는다.
    socket.on('updateUserPosition', function(data) {
        var user = data['user'];
        if(user['socketId'] != mySocketId) scene.moveOtherUser(user['name'], user['X'], user['Y'], user['anim']);
    });

    // Socket receive another user in and out
    socket.on('userConnect', function (data) {
        var user = data['user'];
        var isOwner = user['owner'];

        if(isOwner) {
            $('#chat_area').append('<span><b>' + teacherIcon + user['name'] + '</b> is join the room.</span><br>' );
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        else {
            $('#chat_area').append('<span><b>' + user['name'] + '</b> is join the room.</span><br>' );
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        if(user['socketId'] != mySocketId) scene.createOtherUser(user['texture'], user['name'], 'KOSYAS', user['X'], user['Y'], user['anim']);
    });

    socket.on('userLeave', function(data) {
        var user = data['user'];
        var userId = user['name'];
        var isOwner = user['owner'];

        if(isOwner) {
            $('#chat_area').append('<span><b>' + teacherIcon + userId + '</b> is leaved the room.</span><br>');
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        else {
            $('#chat_area').append('<span><b>' + userId + '</b> is leaved the room.</span><br>');
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        scene.destroyOtherUser(userId);
    });

    socket.on('chatMsg', function(data) {
        var user = data['user'];
        var userId = user['socketId'];
        var userName = user['name'];
        var isOwner = user['owner'];
        var msg = data['msg'];

        if(userId == mySocketId) {
            if(isOwner) {
                $('#chat_area').append('<span><b style="color:yellow">' + teacherIcon + userName + '</b> : ' + msg + '</span><br>');
            }
            else {
                $('#chat_area').append('<span><b style="color:yellow">' + userName + '</b> : ' + msg + '</span><br>');
            }
            scene.chatMyChar(msg);
        }
        else {
            if(isOwner) {
                $('#chat_area').append('<span><b>' + teacherIcon + userName + '</b> : ' + msg + '</span><br>');
            }
            else {
                $('#chat_area').append('<span><b>' + userName + '</b> : ' + msg + '</span><br>');
            }
            scene.chatOtherUser(userName, msg);
        }

        $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
    });

    // Chat
    $('#text').keypress(function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            var text = $('#text').val();
            $('#text').val('');
            socket.emit('chat', {'msg': text, 'room': myRoomName});
        }
    });
});