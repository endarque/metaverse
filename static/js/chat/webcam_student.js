$(document).ready(function () {
    $('#close_web_chat').click(function() {
        $('#web_chat').hide();
        $.unlockBody();
    });
    var $docEl = $('html, body'),
        $wrap = $('.wrap'),
        $scrollTop;

    $.lockBody = function() {
        if(window.pageYOffset) {
            $scrollTop = window.pageYOffset;
            $wrap.css({
                top: - ($scrollTop)
            });
        }
        $docEl.css({
            height: "100%",
            overflow: "hidden"
        });
    }

    $.unlockBody = function() {
        $docEl.css({
            height: "",
            overflow: ""
        });
        $wrap.css({
            top: ''
        });
        window.scrollTo(0, $scrollTop);
        window.setTimeout(function () {
            $scrollTop = null;
        }, 0);
    }
    $('.respon').slick({
      arrow: false,
      dots: false,
      infinite: false,
      speed: 300,
      slidesToShow: 6,
      slidesToScroll: 1,
      prevArrow : "",
	  nextArrow : "",
	  centeredSlides : false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            arrow: false,
            dots: false,
            slidesToShow: 3,
            slidesToScroll: 3,
            infinite: true,
          }
        },
        {
          breakpoint: 600,
          settings: {
            arrow: false,
            dots: false,
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
        // You can unslick at a given breakpoint now by adding:
        // settings: "unslick"
        // instead of a settings object
      ]
    });
    $.lockBody();

    var createUserCam = function(user) {
        if(!user['is_teacher']) {
            $('#div_studentCam').slick('slickAdd',
                '<div id="'+ user['socketId'] +'" style="padding:10px;display: flex;justify-content: center;flex-direction: column;flex-wrap: wrap;align-content: center;">' +
                    '<img src="static/images/avatar.jpg" width=160px; height=160px;>' +
                    '<div style="display: flex; justify-content: space-around;flex-direction: row;align-items: center">' +
                        '<button type="button" class="btn btn-block btn-sm btn-outline-success" style="margin-top:0;margin-right:2px;">' +
                            '<i class="fas fa-user"></i>' +
                            '<span class="like-count">' + ' test' + '</span>' +
                        '</button>' +
                        '<button type="button" class="btn btn-block btn-sm btn-outline-success" style="margin-top:0;margin-left:2px;">' +
                            '<i class="fa fa-fw fa-paint-brush"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>'
            );
        }
    }

    var setUserImg = function(id, img) {
        $('#' + id).children("img").attr('src', img);
    }

    var video = document.getElementById('myCam');
    var canvas = document.getElementById('myCanvas');
    var context = canvas.getContext('2d');
    var teacherIcon = '<i class="fa fa-fw fa-graduation-cap"></i>';
    var teacherCam = document.getElementById('teacherCam');
    var mySocketId = '';
    var sendCamInterval;

    var fn_interval = function (mySocketId, myRoomName) {
        const FPS = 30;
        sendCamInterval = setInterval(() => {
            width = 320;//video.offsetWidth;
            height = 320;//video.offsetHeight;

            context.drawImage(video, 0, 0, width, height);
            var image = canvas.toDataURL('image/jpeg', 0.5);
            context.clearRect(0, 0, width, height);
            var data = {'socketId': mySocketId, 'data': image, 'room': myRoomName};
            socket.emit('cam', data);
        }, 1000 / FPS);
    }

    let All_mediaDevices=navigator.mediaDevices
    if (!All_mediaDevices || !All_mediaDevices.getUserMedia) {
        console.log("getUserMedia() not supported.");
        return;
    }
    All_mediaDevices.getUserMedia({
       audio: true,
       video: true
    })
    .then(function(vidStream) {
       if ("srcObject" in video) {
          video.srcObject = vidStream;
       } else {
          video.src = window.URL.createObjectURL(vidStream);
       }
       video.onloadedmetadata = function(e) {
          video.play();
       };
    })
    .catch(function(e) {
       console.log(e.name + ": " + e.message);
    });

    var socket = io.connect(window.location.protocol + '//' + document.domain + ':' + location.port + '/webCam');
    socket.on('connect', function () {
        console.log("Connected...!", socket.connected)
    });

    socket.on('connectionSuccess', function() {
        console.log(myRoomName);
        let roomName = myRoomName;
        socket.emit('joinRoom', {'room': roomName, 'is_teacher': false })
    });

    // 선생님이 이미 존재
    socket.on('teacherIsAlreadyExists', function() {
        alert('teacherIsAlreadyExists');
        self.opener = self;
        window.close();
    });

    // receive userId
    socket.on('userIdReturn', function(data) {
        // set my information
        mySocketId = data['socketId'];
        myRoomName = data['room'];

        data['userList'].forEach(function(user) {
            createUserCam(user);
        });

        // send my cam data to socket
        fn_interval(mySocketId, myRoomName);
    });

    // Socket receive user in and out
    socket.on('userConnect', function (data) {
        user = data['user'];
        userId = user['socketId'];
        isTeacher = user['is_teacher'];

        if(mySocketId != user['socketId']) {
            createUserCam(user);
        }

        if(isTeacher) {
            $('#chat_area').append('<span><b>' + teacherIcon + user['socketId'] + '</b> is join the room.</span><br>' );
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        else {
            $('#chat_area').append('<span><b>' + user['socketId'] + '</b> is join the room.</span><br>' );
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
    });

    socket.on('userLeave', function(data) {
        user = data['user'];
        userId = user['socketId'];
        isTeacher = user['is_teacher'];

        if(isTeacher) {
            teacherCam.setAttribute('src', 'static/images/avatar.jpg');
            $('#chat_area').append('<span><b>' + teacherIcon + userId + '</b> is leaved the room.</span><br>');
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
        else {
            $('#div_studentCam').slick('slickRemove', $('.slick-slide').index(document.getElementById(userId)));
            $('#div_studentCam').slick('refresh');
            $('#chat_area').append('<span><b>' + userId + '</b> is leaved the room.</span><br>');
            $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
        }
    });

    // Socket receive cam image data
    socket.on('teacherCam', function (image) {
        if(teacherCam) teacherCam.setAttribute('src', image);
    });

    socket.on('studentCams', function (data) {
        setUserImg(data['socketId'], data['image']);
        //studentCams[data['id']].setAttribute('src', data['image']);
    });

    socket.on('chatMsg', function(data) {
        user = data['user'];
        userId = user['socketId'];
        isTeacher = user['is_teacher'];
        msg = data['msg'];
        if(userId == mySocketId) {
            if(isTeacher) {
                $('#chat_area').append('<span><b style="color:yellow">' + teacherIcon + userId + '</b> : ' + msg + '</span><br>');
            }
            else {
                $('#chat_area').append('<span><b style="color:yellow">' + userId + '</b> : ' + msg + '</span><br>');
            }
        }
        else {
            if(isTeacher) {
                $('#chat_area').append('<span><b>' + teacherIcon + userId + '</b> : ' + msg + '</span><br>');
            }
            else {
                $('#chat_area').append('<span><b>' + userId + '</b> : ' + msg + '</span><br>');
            }
        }

        $('#chat_area').scrollTop($('#chat_area').prop('scrollHeight'));
    });

    socket.on('cameraOff', function (data) {
        user = data['user']
        userId = user['socketId'];
        is_teacher = user['is_teacher'];

        if (is_teacher) {
            teacherCam.setAttribute('src', 'static/images/avatar.jpg');
        }
        else {
            setUserImg(userId, "static/images/avatar.jpg");
        }
    });

    // Chat
    $('#text').keypress(function(e) {
        var code = e.keyCode || e.which;
        if (code == 13) {
            text = $('#text').val();
            $('#text').val('');
            socket.emit('chat', {'msg': text, 'room': myRoomName});
        }
    });

    // camera on & off
    $('#btn_camera').click(function () {

        var class_on = 'fa fa-fw fa-eye';
        var class_off = 'fa fa-fw fa-eye-slash';

        var name = $(this).attr('name');

        if (name == 'camera_on') {
            $(this).attr('name', 'camera_off');
            $(this).children("i").attr('class', class_off);
            video.pause();
            socket.emit('cameraOff', { 'room': myRoomName});
            clearInterval(sendCamInterval);
        }
        else {
            $(this).attr('name', 'camera_on');
            $(this).children("i").attr('class', class_on);
            video.play();

            fn_interval(mySocketId, myRoomName);
        }
    });

    // microphone on & off
    $('#btn_mic').click(function () {

        var class_on = 'fa fa-fw fa-microphone';
        var class_off = 'fa fa-fw fa-microphone-slash';

        var name = $(this).attr('name');

        if (name == 'mic_on') {
            $(this).attr('name', 'mic_off');
            $(this).children("i").attr('class', class_off);
            video.muted = true;
        }
        else {
            $(this).attr('name', 'mic_on');
            $(this).children("i").attr('class', class_on);
            video.muted = false;
        }
    });
});