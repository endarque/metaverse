import User from './user.js';

export default class MyUser extends User {
    constructor(scene, x, y, texture, id, frame) {
        super(scene, x, y, texture, id, frame);
        this.playContainerBody = this.userContainer.body;

        this.userTexture = texture;

        this.prevAnim = this.userTexture + '_idle_down';
        this.play(this.prevAnim, true);
        this.upKey     = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
	    this.downKey   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
	    this.leftKey   = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
	    this.rightKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)

	    // zone 추가 ( 현재 내가 상호작용하는 Item을 판별하기 위함 )
	    this.zoneSize = 16;
	    this.zone = new Phaser.GameObjects.Zone(scene, 0, 0, this.zoneSize, this.zoneSize);
	    this.selectedItem;

	    scene.physics.add.existing(this.zone);
    }

    setUserName(name) {
        this.userName.setText(name);
    }

    setUserTitle(title) {
        this.userTitle.setText('<' + title + '>');
    }

    setUserTexture(texture) {
        this.userTexture = texture;
        this.prevAnim = this.userTexture + '_idle_down';
        this.play(this.prevAnim, true);
    }

    getUserAnims() {
        if (this.anims.currentAnim)
            return this.anims.currentAnim.key;
    }

    // 캐릭터 삭제
    destroy(fromScene) {
        this.userContainer.destroy();
        super.destroy(fromScene);
    }

    update() {

        const speed = 200;
        let vx = 0;
        let vy = 0;

        if (this.leftKey.isDown)
        {
            vx -= speed;
        }
        else if (this.rightKey.isDown)
        {
            vx += speed;
        }
        if (this.upKey.isDown)
        {
            vy -= speed;
        }
        else if (this.downKey.isDown)
        {
            vy += speed;
        }

        this.setVelocity(vx, vy);
        this.body.velocity.setLength(speed);

        this.playContainerBody.setVelocity(vx, vy);
        this.playContainerBody.velocity.setLength(speed);

        if (vx > 0) {
            // right
            this.prevAnim = this.userTexture + '_run_right';
            this.play(this.prevAnim, true);
            this.zone.setPosition(this.x + this.zoneSize * 2, this.y);
        }
        else if (vx < 0) {
            // left
            this.prevAnim = this.userTexture + '_run_left';
            this.play(this.prevAnim, true);
            this.zone.setPosition(this.x - this.zoneSize * 2, this.y);
        }
        else if (vy > 0) {
            // up
            this.prevAnim = this.userTexture + '_run_down';
            this.play(this.prevAnim, true);
            this.zone.setPosition(this.x, this.y + this.zoneSize * 2);
        }
        else if (vy < 0) {
            // down
            this.prevAnim = this.userTexture + '_run_up';
            this.play(this.prevAnim, true);
            this.zone.setPosition(this.x, this.y - this.zoneSize * 2);
        }
        else {
            // idle
            var parts = this.prevAnim.split('_');
            parts[1] = 'idle';
            const newAnim = parts.join('_')
            if (this.anims.currentAnim.key != newAnim) {
                this.play(newAnim, true);
            }
        }

        if(this.selectedItem) {
            if(!this.scene.physics.overlap(this.zone, this.selectedItem)) {
                this.selectedItem.clearDialogBox();
                this.selectedItem = null;
            }
        }
    }
}

// MyUser를 Phaser GameFactory에 등록하여 사용
Phaser.GameObjects.GameObjectFactory.register('myUser', function (x, y, texture, id, frame) {
    const sprite = new MyUser(this.scene, x, y, texture, id, frame);
    this.displayList.add(sprite);
    this.updateList.add(sprite);
    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY);
    const collisionScale = [0.5, 0.2];
    sprite.body
        .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
        .setOffset(sprite.width * (1 - collisionScale[0]) * 0.5, sprite.height * (1 - collisionScale[1]));
    return sprite;
});
