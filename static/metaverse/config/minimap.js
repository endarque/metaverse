import Minimap from '../api/scenes/minimap.js'

const config = {
    type: Phaser.AUTO,
    parent: "phaser-minimap",
    mode: Phaser.Scale.ScaleModes.AUTO,
    width: 200,
    height: 200,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: [Minimap]
}

export const game = new Phaser.Game(config)