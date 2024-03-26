import MyUser from '../objects/character/myUser.js'
import OhterUser from '../objects/character/otherUser.js'
import prop from '../info/room_info.js'
import { createCharacterAnims } from '../anim/charAnim.js'

class MainLand extends Phaser.Scene {

    constructor () {
        super({ key: 'MainLand' });
      }

	preload() {
	    var game = this;
	    this.isDown = true;
        this.marker;
        this.colorLayer;
        this.pointX;
        this.pointY;
        this.rectWidth = 20;
        this.lastTime = 0;
        this.otherUser = {};

        game.load.tilemapTiledJSON('map', prop['info_map']);
		var tileJson = JSON.parse(prop['info_tile']);
		Object.keys(tileJson).forEach(function(k){
            game.load.spritesheet(k, tileJson[k], {
                frameWidth: 32,
                frameHeight: 32,
            });
        });

        this.load.spritesheet('lucy', 'static/metaverse/asset/char/lucy/lucy.png', {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet('adam', 'static/metaverse/asset/char/adam/adam.png', {
            frameWidth: 32,
            frameHeight: 48,
        });
        this.load.spritesheet('ash', 'static/metaverse/asset/char/ash/ash.png', {
            frameWidth: 32,
            frameHeight: 48,
        });;
        this.load.spritesheet('nancy', 'static/metaverse/asset/char/nancy/nancy.png', {
            frameWidth: 32,
            frameHeight: 48,
        });
		/*this.load.html('smalldiv', 'static/test.html');
		this.el = document.getElementById('land_info_detail');
		this.sideBar = this.add.dom(0, 0, this.el);*/
	}

	create() {
	    var game = this;
	    createCharacterAnims(game.anims);
		this.map = game.make.tilemap({ key: 'map' });

		// 맵에 사용된 이미지를 Load 한다.
		var tileJson = JSON.parse(prop['info_tile']);
		// 레이어 정보를 생성한다.
		var layerDataList = {};
		Object.keys(tileJson).forEach(function(k){
            layerDataList[k] = game.map.addTilesetImage(k);
        });

        // 레이어 별 사용된 타일셋 이미지를 불러온다.
		var layerJson = JSON.parse(prop['info_layer']);
		var layerObjList = {};

		// 실제 타일셋 레이어를 생성하여 Draw 해준다.
		Object.keys(layerJson).forEach(function(k){
		    var tileset = layerJson[k].split(' ');
		    var layer = [];
		    for (name in tileset) {
		        layer.push(tileset[name]);
		    }
		    console.log(k, layer);
            layerObjList[k] =  game.map.createLayer(k, layer);
        });

		var layer = this.map.createBlankLayer('layer1', layerObjList['tileset_1']);
		this.colorLayer = this.map.createBlankLayer('color Layer', layerObjList['tileset_1']);
		this.colorLayerData = new Array(this.colorLayer.tilemap.width);


		// 카메라 Zoom
		this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {

			if (deltaY > 0) {
				var newZoom = this.cameras.main.zoom - .1;
				if (newZoom >= 1) {
					this.cameras.main.zoom = newZoom;
				}
			}

			if (deltaY < 0) {
				var newZoom = this.cameras.main.zoom + .1;
				if (newZoom < 3.0) {
					this.cameras.main.zoom = newZoom;
				}
			}
		});

        //destroy,blur,focus,prestep,poststep,prerender,hidden,visible
        this.game.events.addListener('blur', function() {
            // 브라우저가 최상단?에서 벗어났을 경우
            console.log('blur');
        });
        this.game.events.addListener('focus', function() {
            // 브라우저가 최상단?일 경우
            console.log('focus');
        });
        this.game.events.addListener('hidden', function() {
            // 브라우저가 최소화가 되었을 경우
            console.log('hidden');
        });

	}

	update() {
		// Player 업데이트
		if (this.myUser) {
		    this.myUser.update();
		    //this.cameras.main.scrollX = Phaser.Math.Clamp(this.myUser.x, 0, 0);
		    //this.cameras.main.scrollY = Phaser.Math.Clamp(this.myUser.y, 0, 0);
        }
	}

	createMyUser(texture, name, title, x, y) {
        this.myUser = this.add.myUser(x, y, texture, 'testId');
		this.myUser.setUserName(name);
		this.myUser.setUserTitle(title);
		this.myUser.setUserTexture(texture);
		this.cameras.main.startFollow(this.myUser, true);
	}

	chatMyChar(text) {
	    this.myUser.updateDialogBubble(text);
	}

	getMyCharPosition() {
	    if (this.myUser) {
	        return [this.myUser.x, this.myUser.y];
        }
        else return [0, 0]
   	}

   	getMyCharAnim() {
   	    if (this.myUser) return this.myUser.getUserAnims();
   	}

	createOtherUser(texture, name, title, x, y, anim) {
        this.otherUser[name] = this.add.otherUser(x, y, texture, 'testId');
        this.otherUser[name].setUserName(name);
		this.otherUser[name].setUserTitle(title);
		this.otherUser[name].playAnim(anim);
	}

	moveOtherUser(name, x, y, anim) {
	    this.otherUser[name].updatePositionX(x);
	    this.otherUser[name].updatePositionY(y);
	    this.otherUser[name].playAnim(anim);
	}

	chatOtherUser(name, text) {
	    this.otherUser[name].updateDialogBubble(text);
	}

	destroyOtherUser(name) {
        this.otherUser[name].destroy();
	}

    // 키 비활성화
	disableKeys() {
		this.input.keyboard.enabled = false;
		this.input.mouse.enabled = false;
	}

    // 키 활성화
	enableKeys() {
		this.input.keyboard.enabled = true;
		this.input.mouse.enabled = true;
	}
}

export default MainLand;