from flask import Flask, render_template, session, copy_current_request_context, redirect, url_for,  request, Blueprint
from flask_socketio import SocketIO, emit, disconnect
from flask_login import LoginManager, current_user, login_required, logout_user
from threading import Lock
# import module.DB.module_DB as db
from module.login.module_loginGoogle import loginGoogle
from module.login.module_loginKakao import loginKakao
from module.login.module_user import User
from module.chat.module_webCam import webCam
from module.sockets.module_socketRoom import socketRoom
from manager.tiledMap.tiledMap import get_mapInformation
import numpy as np
import os, ssl, ast, random

base_dir = os.path.dirname(__file__)
template_dir = os.path.join(base_dir, 'templates/ui')
#print("경로 확인:" + template_dir)

###########################
socketio = SocketIO(logger=False, engineio_logger=False)
socketio.on_namespace(webCam('/webCam'))
socketio.on_namespace(socketRoom('/socketRoom'))
###########################
"""Create an application."""
app = Flask(__name__, template_folder=template_dir)
app.config['SECRET_KEY'] = 'hard to guess...'
###########################
# LOGIN #
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"
loginGoogle = loginGoogle()
loginKakao = loginKakao()

@login_manager.unauthorized_handler
def unauthorized():
    return "You must be logged in to access this content."

@login_manager.user_loader
def load_user(user_id):
    print("load_user", user_id)
    return User.get(user_id)

'''
    Login with Google
'''
@app.route('/login/google')
def login_google():
    redirectUri = loginGoogle.login(request.base_url)
    # print(redirectUri)
    return redirect(redirectUri)


@app.route('/login/google/callback')
def login_googleCallback():
    resp = loginGoogle.callback(request.args.get("code"), request.url, request.base_url)
    # print(resp)
    if resp == 400:
        print("User email not available or not verified by Google.")
        return redirect(url_for('home'))
    else:
        # login 성공
        return redirect(url_for('meta_land'))

'''
    Login with Kakao
'''
@app.route('/login/kakao')
def login_kakao():
    oauthUrl = loginKakao.login(request.base_url)
    return redirect(oauthUrl)

@app.route('/login/kakao/callback')
def login_kakaoCallback():
    loginKakao.callback(request.args.get("code"), request.base_url)
    return redirect(url_for('home'))
'''
    Login Page
'''
@app.route('/login')
def login():
    if not current_user.is_authenticated:
        return render_template('/login/login.html')
    else:
        return redirect(url_for('meta_land'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))
###########################

@app.route('/index', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        session['name'] = request.form['name']
        session['room'] = request.form['room']
        return redirect(url_for('demo2'))
    return render_template('index.html')


@app.route('/api/room/<id>', methods=['GET', 'PUT'])
def room(id):
    room_id = id
    map_info = 'static/map/land/test_map/test_map2.json'
    tile_set = 'static/map/land/test_map/tmw_desert_spacing.png'
    character_data = 'static/map/land/test_map/wabbit.png'

    name = session.get('name', '')
    room = session.get('room', '')
    data = [map, tile_set, character_data, name, room]
    info = {
        'map': map_info,
        'tile': tile_set
    }
    print(info)
    return info


@app.route('/')
def home():
    if current_user.is_authenticated:
        print(current_user.is_authenticated)
        import fnmatch
        room_img = []
        land_img = []
        city_img = []
        for (root, directories, files) in os.walk('static'):
            for file in files:
                if fnmatch.fnmatch(file, "room_*.png"):
                    file_path = os.path.join(root, file)
                    room_img.append(file_path[7:len(file_path)].replace('\\','/'))
                elif fnmatch.fnmatch(file, "land_*.png"):
                    file_path = os.path.join(root, file)
                    land_img.append(file_path[7:len(file_path)].replace('\\','/'))
                elif fnmatch.fnmatch(file, "city_*.png"):
                    file_path = os.path.join(root, file)
                    print(file_path)
                    city_img.append(file_path[7:len(file_path)].replace('\\','/'))
        return render_template('/contents/main_contents.html', room_img = room_img, land_img = land_img, city_img = city_img, session=current_user.is_authenticated)
    else:
        print("You are not an authenticated user.")
        return redirect(url_for('login'))

@app.route('/meta_land')
def meta_land():
#    if current_user.is_authenticated:
    print(current_user.is_authenticated)
    import fnmatch
    room_img = []
    land_img = []
    city_img = []
    for (root, directories, files) in os.walk('static'):
        for file in files:
            if fnmatch.fnmatch(file, "room_*.png"):
                file_path = os.path.join(root, file)
                room_img.append(file_path[7:len(file_path)].replace('\\', '/'))
            elif fnmatch.fnmatch(file, "land_*.png"):
                file_path = os.path.join(root, file)
                land_img.append(file_path[7:len(file_path)].replace('\\', '/'))
            elif fnmatch.fnmatch(file, "city_*.png"):
                file_path = os.path.join(root, file)
                print(file_path)
                city_img.append(file_path[7:len(file_path)].replace('\\', '/'))
    return render_template('/contents/metaverse/meta_land.html', room_img=room_img, land_img=land_img, city_img=city_img,
                           session=current_user.is_authenticated)
##    else:
 #       print("You are not an authenticated user.")
  #      return redirect(url_for('login'))

@app.route('/meta_art')
@login_required
def meta_art():
    if current_user.is_authenticated:
        print(current_user.is_authenticated)
        return render_template('/contents/metaverse/meta_art.html', session=current_user.is_authenticated)
    else:
        print("You are not an authenticated user.")
        return redirect(url_for('login'))

@app.route('/draw_webChatStudent')
def draw_webChatStudent():
    room = 'demo1'  # + str(time.time())
    return render_template('/contents/chat/webChat/web_chat_student.html', room=room)


@app.route('/draw_webChatTeacher')
def draw_webChatTeacher():
    room = 'demo1'  # + str(time.time())
    return render_template('/contents/chat/webChat/web_chat_teacher.html', room=room)


@app.route('/motion/hand')
def motion_hand():
    return render_template('/motion/handpose.html')

@app.route('/dashboard')
@login_required   # 로그인 안하면 페이지로 접근하지 못하게 할 수 있음
def dashboard():
    map = 'static/map/main_map/main.json'
    tile_set = 'static/map/main_map/tmw_desert_spacing.png'
    map_data = [map, tile_set]
    return render_template('/contents/dashboard_contents.html',  map=map_data)

@app.route('/demo1', methods=['GET', 'POST'])
def demo1():
    name = request.args.get('name')
    print(name)
    map_type, map_name, map_img_name, map_info_text_data, map_layer_num, map_width, map_height, tilesetList = get_mapInformation(name)

    defaultPath = '/static/metaverse/asset/map/' + map_type + '/' + map_name + '/'
    map = defaultPath + map_name + '.json' #land/land_1/practiceLand.json'
    tilesetDic = {}
    for tileset in tilesetList:
        tilesetDic[tileset.rsplit('.')[0]] = defaultPath + 'assets/' + tileset

    layerlist = []
    for t in map_info_text_data:
        if t == '': continue
        layerlist.append(str.split(t[1:][:-1], ', '))
    print(layerlist)
    layerDic = {}
    for i in range(len(layerlist)):
        if i % 2 == 1: continue
        for j in range(len(layerlist[i])):
            t = layerlist[i + 1][j]
            print(layerlist[i][j], t)
            if t[0] == '(':
                layerDic[layerlist[i][j]] = t[1:][:-1]
            else:
                layerDic[layerlist[i][j]] = t

    print(layerDic)
    background = 'static/images/map/MapBackground.jpg'
    marker = 'static/images/map/map-pin.png'

    # if request.method == 'POST':
    #     session['name'] = request.form['name']
    #     session['room'] = request.form['room']
    #     session['map'] = map_data
    #     session['character'] = character_data
    #     return redirect(url_for('demo2'))
    return render_template('/contents/demo1_contents.html', map=map, tileset=tilesetDic, layer=layerDic, background=background, marker=marker,
                           room=name)


@app.route('/demo2', methods=['GET', 'POST'])
def demo2():
    # map = 'static/map/main_map/main.json'
    # tile_set = 'static/map/main_map/tmw_desert_spacing.png'
    name = request.form['nickname']#request.args.get('name')
    room = request.form['room']#request.args.get('room')
    print(name, room)
    map_type, map_name, map_img_name, map_info_text_data, map_layer_num, map_width, map_height, tilesetList = get_mapInformation(room)

    defaultPath = '/static/metaverse/asset/map/' + map_type + '/' + map_name + '/'
    map = defaultPath + map_name + '.json'  # land/land_1/practiceLand.json'
    tilesetDic = {}
    for tileset in tilesetList:
        tilesetDic[tileset.rsplit('.')[0]] = defaultPath + 'assets/' + tileset

    layerlist = []
    for t in map_info_text_data:
        if t == '': continue
        layerlist.append(str.split(t[1:][:-1], ', '))
    print(layerlist)
    layerDic = {}
    for i in range(len(layerlist)):
        if i % 2 == 1: continue
        for j in range(len(layerlist[i])):
            t = layerlist[i + 1][j]
            print(layerlist[i][j], t)
            if t[0] == '(':
                layerDic[layerlist[i][j]] = t[1:][:-1]
            else:
                layerDic[layerlist[i][j]] = t

    print(layerDic)

    map_data = [map, tilesetDic, layerDic]
    rnd = random.randrange(1, 5)
    if rnd == 1:
        character_data = 'adam'
    elif rnd == 2:
        character_data = 'ash'
    elif rnd == 3:
        character_data = 'lucy'
    else:
        character_data = 'nancy'

    if name == '' or room == '':
        return redirect(url_for('demo1'))

    return render_template('/contents/demo2_contents.html', character=character_data, map=map_data, name=name, room=room)


@app.route('/QNA')
def QNA():
    return render_template('/contents/board_contents.html')

socketio.init_app(app)

from module.chat.events import ChatNamepsace
socketio.on_namespace(ChatNamepsace('/demo2'))

if __name__ == '__main__':
    socketio.run(app, port=5443, allow_unsafe_werkzeug=True, ssl_context=('./cert/private.crt', './cert/private.key'))

