import User from './user.js';

export default class OtherUser extends User {

    constructor(scene, x, y, texture, id, name, frame) {
        super(scene, x, y, texture, id, frame);
        this.targetPosition = [x, y];
        this.userName.setText(name);
        this.playContainerBody = this.userContainer.body;
    }

    setUserName(name) {
        this.userName.setText(name);

    }

    setUserTitle(title) {
        this.userTitle.setText('<' + title + '>');
    }

    updatePositionX(value) {
        this.targetPosition[0] = value;
    }

    updatePositionY(value) {
        this.targetPosition[1] = value;
    }

    playAnim(anim) {
        this.anims.play(anim, true);
    }

    destroy(fromScene) {
        this.userContainer.destroy();
        super.destroy(fromScene);
    }

    /** preUpdate is called every frame for every game object. */
    preUpdate(t, dt) {
        super.preUpdate(t, dt);
        // if Phaser has not updated the canvas (when the game tab is not active) for more than 1 sec
        // directly snap player to their current locations
        if (this.lastUpdateTimestamp && t - this.lastUpdateTimestamp > 750) {
            this.lastUpdateTimestamp = t;
            this.x = this.targetPosition[0];
            this.y = this.targetPosition[1];
            this.userContainer.x = this.targetPosition[0];
            this.userContainer.y = this.targetPosition[1] - 30;
            return;
        }

        this.lastUpdateTimestamp = t;
        this.setDepth(this.y); // change player.depth based on player.y

        const speed = 200; // speed is in unit of pixels per second
        const delta = (speed / 1000) * dt; // minimum distance that a player can move in a frame (dt is in unit of ms)
        let dx = this.targetPosition[0] - this.x;
        let dy = this.targetPosition[1] - this.y;

        // if the player is close enough to the target position, directly snap the player to that position
        if (Math.abs(dx) < delta) {
            this.x = this.targetPosition[0];
            this.userContainer.x = this.targetPosition[0];
            dx = 0;
        }
        if (Math.abs(dy) < delta) {
            this.y = this.targetPosition[1];
            this.userContainer.y = this.targetPosition[1] - 30;
            dy = 0;
        }

        // if the player is still far from target position, impose a constant velocity towards it
        let vx = 0;
        let vy = 0;
        if (dx > 0)
            vx += speed;
        else if (dx < 0)
            vx -= speed;
        if (dy > 0)
            vy += speed;
        else if (dy < 0)
            vy -= speed;

        // update character velocity
        this.setVelocity(vx, vy);
        this.body.velocity.setLength(speed);

        // also update playerNameContainer velocity
        this.playContainerBody.setVelocity(vx, vy);
        this.playContainerBody.velocity.setLength(speed);
    }
}

Phaser.GameObjects.GameObjectFactory.register('otherUser', function (x, y, texture, id, name, frame) {
    const sprite = new OtherUser(this.scene, x, y, texture, id, name, frame);
    this.displayList.add(sprite);
    this.updateList.add(sprite);
    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);
    const collisionScale = [6, 4];
    sprite.body
        .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
        .setOffset(sprite.width * (1 - collisionScale[0]) * 0.5, sprite.height * (1 - collisionScale[1]) * 0.5 + 17);
    return sprite;
});
