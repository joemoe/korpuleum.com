import PlayScene from './scenes/PlayScene.js'

const config = {
	type: Phaser.AUTO,
	width: 1024,
	height: 512,
	backgroundColor: '#000000',
	parent: 'phaser',
	physics: {
		default: 'arcade'
	},
	scene: [PlayScene]
}

let game = new Phaser.Game(config);

export default game;