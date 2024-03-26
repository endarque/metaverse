// MAAP
// Copyright (C) 2022 JS Han

import MainLand from '../api/scenes/map.js'
import Minimap from '../api/scenes/minimap.js'

const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    dom: {
        createContainer: true
    },
    scene: [MainLand, Minimap]
}

export const game = new Phaser.Game(config)