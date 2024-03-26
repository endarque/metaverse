
export default class Land_info extends Phaser.Scene {
    constructor() {
        super({ key: 'land_info', active: true })
    }

    preload() {
        this.load.setBaseURL('/static')
        this.load.image('grass', Grass)
    }

    create() {
        this.grass = this.add.image(400, 300, 'grass')
        this.grass.setScale(2.5)
    }
}