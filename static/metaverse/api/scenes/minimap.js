import map_info from '../info/map_info.js'

export default class Minimap extends Phaser.Scene {

    constructor() {
		super('Minimap')
	}

	preload() {
        var game = this;
        game.load.tilemapTiledJSON('map', map_info['info_map']);
		var tileJson = JSON.parse(map_info['info_tile']);
		Object.keys(tileJson).forEach(function(k){
            game.load.spritesheet(k, tileJson[k], {
                frameWidth: 32,
                frameHeight: 32,
            });
        });
		this.rectWidth = 20;
	}

	create({ map: map }) {
        var game = this;

        this.map = this.make.tilemap({ key: 'map' });
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
            layerObjList[k] =  game.map.createLayer(k, layer);
        });

        this.cameras.main.setViewport(20, 20, 200, 200).setZoom(0.1);
        this.cameras.main.setBackgroundColor(0x0F00F0, 1);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels + 20, this.map.heightInPixels + 20);

        this.viewRect = this.add.graphics();
		this.viewRect.lineStyle(this.rectWidth, 0xFFFFFF, 1);
        /*this.minimap = this.cameras.add(20, 20, 200, 200).setZoom(1);
		this.minimap.setBackgroundColor(0x0F00F0, 1);*/
		/*this.minimap.scrollX = this.map.widthInPixels / 2;
		this.minimap.scrollY = this.map.heightInPixels / 2;*/
		console.log("minimap");
	}

	update() {

	}

	draw_minimapRect = function(worldView) {

        this.viewRect.clear();
        this.viewRect.lineStyle(this.rectWidth, 0xFFFFFF, 1);
        this.viewRect.strokeRect(worldView.x - this.rectWidth,
			worldView.y - this.rectWidth,
			worldView.width - this.rectWidth,
			worldView.height + this.rectWidth);
	}
}
