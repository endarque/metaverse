// MAAP
// Copyright (C) 2022 JS Han

import room from '../api/scenes/room.js'

const config = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    mode: Phaser.Scale.ScaleModes.AUTO,
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
    scene: [room]
};

export const game = new Phaser.Game(config)