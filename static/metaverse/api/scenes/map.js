import map_info from '../info/map_info.js'

export default class MainLand extends Phaser.Scene {

    constructor() {
		super('MainLand')
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
        this.pointElement = document.getElementById('map_point_ui');
        this.boxElement = document.getElementById('map_box_ui');
		game.load.tilemapTiledJSON('map', map_info['info_map']);
		var tileJson = JSON.parse(map_info['info_tile']);
		Object.keys(tileJson).forEach(function(k){
            game.load.spritesheet(k, tileJson[k], {
                frameWidth: 32,
                frameHeight: 32,
            });
        });
		game.load.image('background', map_info['info_background']);
	}

	create() {
        var game = this;
		this.map = game.make.tilemap({ key: 'map' });
        this.backgroundImage = this.add.image(this.map.widthInPixels / 2, this.map.heightInPixels / 2, 'background');
        this.backgroundImage.setDisplaySize(this.map.widthInPixels + 600, this.map.heightInPixels + 600);

		// 맵에 사용된 이미지를 Load 한다.
		var tileJson = JSON.parse(map_info['info_tile']);
		// 레이어 정보를 생성한다.
		var layerDataList = {};
		Object.keys(tileJson).forEach(function(k){
            layerDataList[k] = game.map.addTilesetImage(k);
        });

        // 레이어 별 사용된 타일셋 이미지를 불러온다.
		var layerJson = JSON.parse(map_info['info_layer']);
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
		// 마커 생성. 선택된 타일에 표시할 마커를 생성
		this.marker = this.add.graphics();
		this.marker.lineStyle(2, 0x000000, 1);
		this.marker.fillStyle(0xF0F0F0, 1.0);
		this.marker.fillRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);
		this.marker.strokeRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);

		// 타일에 테두리 그리기
		/*this.tileLine = this.add.graphics();
		this.tileLine.lineStyle(2, 0x000000, 1);
		this.tileLine.strokeRect(0, 0, this.map.tileWidth * layer.scaleX, this.map.tileHeight * layer.scaleY);*/

        // 메인 카메라
		this.cameras.main.setZoom(1);
		this.cameras.main.setBackgroundColor(0x131315, 1);
		this.cameras.main.setBounds(-350, -350, this.map.widthInPixels + 700, this.map.heightInPixels + 700, true);

		// 미니맵 씬 추가
		this.scene.launch('Minimap', { map: this.map })
        this.minimap = this.scene.get('Minimap');

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
			/*this.map.scrollX -= (p.x - p.prevPosition.x) / this.cameras.main.zoom;
			this.map.scrollY -= (p.y - p.prevPosition.y) / this.cameras.main.zoom;*/
		});
	}

	update() {
	    //console.log("run : " + this.game.events.eventNames());
		// 마우스 지점 타일 선택
		var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
		var pointerTileX = this.map.worldToTileX(worldPoint.x);
		var pointerTileY = this.map.worldToTileY(worldPoint.y);

		this.marker.x = this.map.tileToWorldX(pointerTileX);
		this.marker.y = this.map.tileToWorldY(pointerTileY);

        this.minimap.draw_minimapRect(this.cameras.main.worldView);
		/*this.viewRect.clear();
		this.viewRect.lineStyle(this.rectWidth, 0xFFFFFF, 1);
		this.viewRect.strokeRect(this.cameras.main.worldView.x - this.rectWidth,
			this.cameras.main.worldView.y - this.rectWidth,
			this.cameras.main.worldView.width + this.rectWidth,
			this.cameras.main.worldView.height + this.rectWidth);*/

		// Tile Data 가 Null이 아니라면 marker를 표시, 아니라면 marker를 없앤다.
		// Option 값 True로 주면 map안의 검정값에도 반응함.
		if (this.map.getTileAt(pointerTileX, pointerTileY, false, 'Grid') != null) {
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
                        /*this.pointX = this.map.tileToWorldX(tile.x);
                        this.pointY = this.map.tileToWorldX(tile.y);*/
                        var point = this.add.dom(this.map.tileToWorldX(pointerTileX), this.map.tileToWorldY(pointerTileY), this.pointElement).setOrigin(0);
                        var box = this.add.dom(this.map.tileToWorldX(pointerTileX), this.map.tileToWorldY(pointerTileY), this.boxElement).setOrigin(0);
                    }
                    else {
                        // 일반 클릭
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
				this.isDown = true;
			}
		}

		// 맵 마커 좌표 설정
        //console.log((this.map.tileWidth / 2) * this.cameras.main.zoom);
        /*$('#map_point_ui').css("left", this.map.tileToWorldX(pointerTileX));
        $('#map_point_ui').css("top", this.map.tileToWorldY(pointerTileY));*/
	}
}
