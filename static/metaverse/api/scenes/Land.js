import MyPlayer from '../objects/character/myPlayer.js'
import OhterPlayer from '../objects/character/otherPlayer.js'
import {room_info} from '../info/room_info.js'

export default class Land extends Phaser.Scene {

    constructor() {
        super({ key: 'land', active: true})
        this.socket = io.connect('http://' + document.domain + ':' + location.port + '/demo2');
        this.configure(this.socket);
    }

    configure(socket) {
        socket.on('connect', _ => {
            //socket.emit('join', { playerId: this.scene.player.ID, username: this.scene.player.username, lobby: this.lobbyId })
            socket.emit('joined', {});
            socket.emit('text', {msg: "입장했으!"});
            // 내 캐릭터 생성
            console.log(data)
            this.createMyPlayer( 'test', 'KOSYAS');

        })
        socket.on('close', _ => {
            //socket.emit('leave', { playerId: this.scene.player.ID, username: this.scene.player.username, lobby: this.lobbyId })
        })
        socket.on('message', data => {
             //this.add.text(200,50*Math.random(),data.msg);
             this.myPlayer.updateDialogBubble(data.msg.split(':')[1]);
            //this.msgSwitch(msg)
        })
        socket.current = {
          socket
        }

        return function cleanup() {
          if (socket.current !== null) {
            socket.current.close()
          }
        }
    }

	preload() {
	    this.isDown = true;
        this.marker;
        this.colorLayer;
        this.pointX;
        this.pointY;
        this.rectWidth = 20;
        this.lastTime = 0;

		this.load.tilemapTiledJSON('map', room_info.info_map);
		this.load.spritesheet('desert_spacing_tileset', room_info.info_tile, {
			frameWidth: 32,
			frameHeight: 32,
		});
	    this.load.image('myChar', room_info.info_char);
	    this.load.image('otherChar', room_info.info_char); //prop['otherCharacter']
	}

	create() {
		this.map = this.make.tilemap({ key: 'map' });
		// DOM 방식으로 UI 구현
		/*this.sideBar = this.add.dom(100, 100).createFromCache('smalldiv');
		this.sideBar.node.style.width = 260 + 'px';
		this.sideBar.node.style.height = 100 + '%';
		this.sideBar.updateSize();
		this.sideBar.setScale(50);*/
		// worldmap size에 맞게 물리엔진처리. 캐릭터가 맵 밖으로 빠져나가지 않음
		this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

		// 맵에 사용된 이미지를 Load 한다.
		const ground = this.map.addTilesetImage('desert_spacing_tileset');
		const groundLayer = this.map.createLayer('Tile Layer 1', ground);
		const grassLayer = this.map.createLayer('grass Layer', ground);

		var layer = this.map.createBlankLayer('layer1', ground);
		this.colorLayer = this.map.createBlankLayer('color Layer', ground);
		this.colorLayerData = new Array(this.colorLayer.tilemap.width);

        var i = 0;
		var j = 0;
		for (i = 0; i < this.colorLayerData.length; i++) {
			this.colorLayerData[i] = new Array(this.colorLayer.tilemap.height);
			for (j = 0; j < this.colorLayerData[i].length; j++) {
				this.colorLayerData[i][j] = -1;
			}
		}
		// 파일 데이터가 있다면 읽어들여서 colorLayerData에 씌워준다.
		// 반드시 2차원 배열로 넣어줘야 함
		this.colorLayerFileData = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

		// 파일에서 읽어온 데이터를 2차원 배열에 저장
		i = 0;
		j = 0;
		// color Layer에 반영한다.
		this.colorLayer.putTilesAt(this.colorLayerData, 0, 0);

		// 마커 생성. 선택된 타일에 표시할 마커를 생성
		this.marker = this.add.graphics();
		this.marker.lineStyle(2, 0x000000, 1);
		this.marker.fillStyle(0xF0F0F0, 1.0);
		this.marker.fillRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);
		this.marker.strokeRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);

		// 타일에 테두리 그리기
		this.tileLine = this.add.graphics();
		this.tileLine.lineStyle(2, 0x000000, 1);
		this.tileLine.strokeRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);

        // 미니맵
		this.cameras.main.zoom = 1.0;
		this.minimap = this.cameras.add(10, 10, 200, 200).setZoom(0.15).setName('mini');
		this.minimap.setBackgroundColor(0x000000, 1);
		this.minimap.scrollX = this.map.widthInPixels / 2;
		this.minimap.scrollY = this.map.heightInPixels / 2;
		this.minimap.ignore([this.marker]);


		// 미니맵 view 표시 설정
		this.viewRect = this.add.graphics();
		this.viewRect.lineStyle(this.rectWidth, 0xFFFFFF, 1);
		this.viewRect.strokeRect(this.cameras.main.worldView.x - this.rectWidth,
			this.cameras.main.worldView.y - this.rectWidth,
			this.cameras.main.worldView.width + this.rectWidth,
			this.cameras.main.worldView.height + this.rectWidth);
		this.cameras.main.ignore([this.viewRect]);

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

		// 맵 드레그 부분
		this.input.on("pointermove", function(p) {
			if (!p.isDown) return;

			this.cameras.main.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
			this.cameras.main.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;
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

        // 내 캐릭터 생성
        //this.createMyPlayer('myChar', 'KOSYAS');
	}

	update() {
	    //console.log("run : " + this.game.events.eventNames());
		// 마우스 지점 타일 선택
		var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
		var pointerTileX = this.map.worldToTileX(worldPoint.x);
		var pointerTileY = this.map.worldToTileY(worldPoint.y);

		this.marker.x = this.map.tileToWorldX(pointerTileX);
		this.marker.y = this.map.tileToWorldY(pointerTileY);

		this.viewRect.clear();
		this.viewRect.lineStyle(this.rectWidth, 0xFFFFFF, 1);
		this.viewRect.strokeRect(this.cameras.main.worldView.x - this.rectWidth,
			this.cameras.main.worldView.y - this.rectWidth,
			this.cameras.main.worldView.width + this.rectWidth,
			this.cameras.main.worldView.height + this.rectWidth);

		// Tile Data 가 Null이 아니라면 marker를 표시, 아니라면 marker를 없앤다.
		// Option 값 True로 주면 map안의 검정값에도 반응함.
		if (this.map.getTileAt(pointerTileX, pointerTileY, false, 'Tile Layer 1') != null) {
			this.marker.setVisible(true);

			if (this.input.manager.activePointer.leftButtonDown() && this.isDown) {
				this.isDown = false;
			}
			else if (this.input.manager.activePointer.leftButtonReleased() && !this.isDown) {
				this.isDown = true;
				if (this.input.manager.activePointer.getDistance() == 0) {

                    let clickDelay = this.time.now - this.lastTime;
                    this.lastTime = this.time.now;
                    if(clickDelay < 350) {
                        // 더블 클릭 ( 딜레이는 테스트 하면서 조절 )
                        // 새로운 layer 의 tile data를 바꿔준다.
                        this.colorLayer.putTileAt(5, pointerTileX, pointerTileY);
                        this.colorLayer.getTilesWithin(0, 0, this.colorLayer.tilemap.width, this.colorLayer.tilemap.height).forEach(function(t) {
                            // this.colorLayerData[t.x][t.y] = (t.index == undefined) ? -1 : t.index;
                        });

                        var tile = this.map.getTileAt(pointerTileX, pointerTileY);
                        this.pointX = tile.pixelX;
                        this.pointY = tile.pixelY;
                        $('#map_point_ui').css('display', 'flex');
                        $('#map_name').text("Land " + (tile.x + 1) + ", " + (tile.y + 1));
                        $('#map_point').text((tile.x + 1) + ", " + (tile.y + 1));
                        $('#map_point_detail').html(((tile.x + 1) +", " + (tile.y + 1)));
                    }
                    else {
                        // 일반 클릭
                        //
                        if (this.myPlayer) this.myPlayer.updateDialogBubble("테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.테스트 입니다.");
                    }
				}
			}
		}
		else {
		    // Tile Layer외에 다른 cell을 클릭했을 경우
			this.marker.setVisible(false);

			if (this.input.manager.activePointer.leftButtonDown() && this.isDown) {
				this.isDown = false;
				
			}
			else if (this.input.manager.activePointer.leftButtonReleased() && !this.isDown) {
				$('#map_point_ui').css('display', 'none');
				this.isDown = true;
			}
		}

		// 맵 마커 좌표 설정
		$('#map_point_ui').css("left", (this.pointX - this.cameras.main.worldView.x) * this.cameras.main.zoom);
		$('#map_point_ui').css('margin-left', (this.map.tileWidth / 2) * this.cameras.main.zoom);
		$('#map_point_ui').css("top", (this.pointY - this.cameras.main.worldView.y) * this.cameras.main.zoom - $('#map_point_ui').height());

		// 미니맵 카메라가 캐릭터를 따라서 이동한다.
		//this.minimap.scrollX = Phaser.Math.Clamp(this.player.x, 0, 2000);
		//this.minimap.scrollY = Phaser.Math.Clamp(this.player.y, 0, 2000);

		// Player 업데이트
		if (this.myPlayer) this.myPlayer.update();
	}

	createMyPlayer(name, title) {
        this.myPlayer = this.add.myPlayer(500, 500, 'myChar', 'testId');
		this.myPlayer.setPlayerName(name);
		this.myPlayer.setPlayerTitle(title);
	}

	createOtherPlayer(name, title) {
        this.otherPlayer = this.add.otherPlayer(300, 300, 'otherChar', 'id');
        this.otherPlayer.setPlayerName(name);
		this.otherPlayer.setPlayerTitle(title);
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

/*	function download(content, fileName, contentType) {
		var a = document.createElement("a");
		var file = new Blob([content], { type: contentType });
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();
	}*/

/*	function resize() {
		var canvas = document.querySelector("canvas");
		var windowWidth = window.innerWidth;
		var windowHeight = window.innerHeight;
		var windowRatio = windowWidth / windowHeight;
		var gameRatio = game.config.width / game.config.height;

		if (windowRatio < gameRatio) {
			canvas.style.width = windowWidth + "px";
			canvas.style.height = (windowWidth / gameRatio) + "px";
		}
		else {
			canvas.style.width = (windowHeight * gameRatio) + "px";
			canvas.style.height = windowHeight + "px";
		}
	}*/
}