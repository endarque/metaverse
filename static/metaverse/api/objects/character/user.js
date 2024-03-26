export default class User extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, id, frame) {
        super(scene, x, y, texture, frame);
        // 고정 값
        this.font = 'ms gothic'
        this.maxTextLength = 70;
        this.dialogBlank = 20;

        this.userId = id;
        this.userTexture = texture;
        this.setDepth(this.y);
        this.userContainer = this.scene.add.container(this.x, this.y - 30).setDepth(5000);

        // add dialogBubble to playerContainer
        this.userDialogBubble = this.scene.add.container(0, -30).setDepth(5000);
        this.userContainer.add(this.userDialogBubble);

        // add playerName to playerContainer
        this.userName = this.scene.add
            .text(0, -13, '')
            .setFontFamily(this.font)
            .setFontSize(15)
            .setColor('#000000')
            .setStroke('#FFFFFF', 3)
            .setOrigin(0.5);

        this.userTitle = this.scene.add
            .text(0, 0, '')
            .setFontFamily(this.font)
            .setFontSize(15)
            .setColor('#000000')
            .setStroke('#FFFFFF', 3)
            .setOrigin(0.5);

        this.userContainer.add(this.userName);
        this.userContainer.add(this.userTitle);
        this.scene.physics.world.enable(this.userContainer);

        const playContainerBody = this.userContainer.body;
        const collisionScale = [0.5, 0.2];
        playContainerBody
            .setSize(this.width * collisionScale[0], this.height * collisionScale[1])
            .setOffset(-8, this.height * (1 - collisionScale[1]) + 6);
    }

    updateDialogBubble(content) {
        this.clearDialogBubble();
        // 최대 70글자까지 말풍선에 표시
        const dialogBubbleText = content.length <= this.maxTextLength ? content : content.substring(0, this.maxTextLength).concat('...');
        const innerText = this.scene.add
            .text(0, 0, dialogBubbleText, { wordWrap: { width: 265, useAdvancedWrap: true } })
            .setFontFamily(this.font)
            .setFontSize(15)
            .setColor('#FFFFFF')
            .setOrigin(0.5);

        // set dialogBox slightly larger than the text in it
        const innerTextHeight = innerText.height;
        const innerTextWidth = innerText.width;
        innerText.setY(-innerTextHeight / 2 - this.userName.height / 2);

        const dialogBoxWidth = innerTextWidth + this.dialogBlank;
        const dialogBoxHeight = innerTextHeight + this.dialogBlank;
        const dialogBoxX = innerText.x - innerTextWidth / 2 - (this.dialogBlank / 2);
        const dialogBoxY = innerText.y - innerTextHeight / 2 - (this.dialogBlank / 2);
        this.userDialogBubble.add(this.scene.add
            .graphics()
            .fillStyle(0x000000, 0.9)
            .fillRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 5)
            .lineStyle(2, 0xFFFFFF, 1)
            .strokeRoundedRect(dialogBoxX, dialogBoxY, dialogBoxWidth, dialogBoxHeight, 5));
        this.userDialogBubble.add(innerText);

        // 4초뒤 말풍선 삭제
        this.timeoutID = window.setTimeout(() => {
            this.clearDialogBubble();
        }, 4000);
    }

    clearDialogBubble() {
        clearTimeout(this.timeoutID);
        this.userDialogBubble.removeAll(true);
    }
}