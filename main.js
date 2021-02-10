import PlayScene from './scenes/PlayScene.js'

const config = {
	type: Phaser.AUTO,
	width: 1024,
	height: 512,
	backgroundColor: '#000000',
	parent: 'phaser',
	physics: {
		default: 'arcade',
        arcade: {
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
            debugShowVelocity: true,
            debugVelocityColor: 0xffff00,
            debugBodyColor: 0x0000ff,
            debugStaticBodyColor: 0xffffff
         }
	},
	scene: [PlayScene]
}

let game = new Phaser.Game(config);

export default game;