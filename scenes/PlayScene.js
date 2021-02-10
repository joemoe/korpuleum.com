export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.cursors = null;
		this.me = null;
		this.korpi = null;

		// Settings
		this.D_ACCELERATION = 400;
		this.D_MAXSPEED = 800;
		this.D_DRAG = 200;
	}

	preload() {
	}

	create() {

		for(let i = 1; i <= 10; i++) {
			for(let j = 1; j <= 10; j++) {
				this.createKorpus(i * 34, 100 + j * 34, 0x333333, i / 10, j / 10);
			}
		}

		this.korpi = this.add.group();

		let christi = this.createKorpus(600, 400, 0xffff00, 0.5, 0.5);
		let deus = this.createKorpus(800, 200, 0xff00ff, 0.2, 0.7);
		this.me = this.makeMe(this.createKorpus(512, 256, 0xff0000));

		this.korpi.add(this.me);

		this.cameras.main.setBounds(0, 0, 1024, 512);
		this.cameras.main.startFollow(this.me);

		
		// all about physics

		// interaction
		this.cursors = this.input.keyboard.createCursorKeys();
	}

	update() {
		if(this.cursors.up.isDown)  this.me.body.setAccelerationY(-this.D_ACCELERATION);
		else if (this.cursors.down.isDown) this.me.body.setAccelerationY(this.D_ACCELERATION);
		else this.me.body.setAccelerationY(0);

		if(this.cursors.left.isDown) this.me.body.setAccelerationX(-this.D_ACCELERATION);
		else if(this.cursors.right.isDown) this.me.body.setAccelerationX(this.D_ACCELERATION);
		else this.me.body.setAccelerationX(0);

		//for(let i )
	}

	createKorpus(x, y, color, love = 1, anger = 0) {
		let c = this.add.graphics({ x: x, y: y });

		this.paintKorpus(c, color, love, anger);

		this.physics.add.existing(c);
		c.isCircle = true;
		return c;
	}

	paintKorpus(korpus, color, love, anger) {
		korpus.fillStyle(color);

		// horns
		let r1 = 11, r2 = Math.round(r1 + 3 + 10 * anger), aP = -Math.PI / 4, aD = Math.PI / 6;
		korpus.fillTriangle(
			r1 * Math.cos(aP + aD), r1 * Math.sin(aP + aD), 
			r1 * Math.cos(aP - aD), r1 * Math.sin(aP - aD),
			r2 * Math.cos(aP), r2 * Math.sin(aP)
		);
		aP = -Math.PI - aP;
		korpus.fillTriangle(
			r1 * Math.cos(aP + aD), r1 * Math.sin(aP + aD), 
			r1 * Math.cos(aP - aD), r1 * Math.sin(aP - aD),
			r2 * Math.cos(aP), r2 * Math.sin(aP)
		);

		//body
		korpus.beginPath();
		korpus.arc(0, 0, 12, 0, 360);
		korpus.closePath();
		korpus.fill();	

		// heart
		korpus.fillStyle(0xffffff, 0.2 + 0.8 * love);
		korpus.fillCircle(-4, -3, 4);
		korpus.fillCircle(4, -3, 4);
		korpus.fillTriangle(-9, -2, 9, -2, 0, 9);
	}

	makeMe(c) {
		c.body.collideWorldBounds = true;
		c.body.setMaxSpeed(this.D_MAXSPEED);
		c.body.setFriction(1, 1);
		c.body.setDrag(this.D_DRAG, this.D_DRAG);
		return c;
	}
}
