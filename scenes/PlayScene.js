export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.me = null;
		this.korpi = null;
		this.halos = null;

		this.inAction = false;

		// Settings
		this.D_ACCELERATION = 400;
		this.D_MAXSPEED = 800;
		this.D_MAXSPEED_MIN = 50;
		this.D_DRAG = 500;
		this.D_FRICTION = 1000;
		this.D_HALO_RADIUS = 200;
		this.D_ACTION_RADIUS = 100;

		// keys
		this.cursors = null;
		this.keyR = null;
		this.keyH = null;
	}

	preload() {
	}

	create() {
		this.halos = this.add.graphics();
		this.korpi = this.add.group();

		let christi = this.createKorpus(600, 400, 0xffff00, 0.5, 0.5);
		let deus = this.createKorpus(800, 200, 0xff00ff, 0.2, 0.7);
		this.korpi.add(christi);
		this.korpi.add(deus);

		this.me = this.makeMe(this.createKorpus(512, 256, 0xff0000));

		//this.cameras.main.setBounds(0, 0, 1024, 512);
		//this.cameras.main.startFollow(this.me);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
	}

	update() {
		if(this.inAction) return;

		if(this.cursors.up.isDown)  this.me.body.setAccelerationY(-this.D_ACCELERATION);
		else if (this.cursors.down.isDown) this.me.body.setAccelerationY(this.D_ACCELERATION);
		else this.me.body.setAccelerationY(0);

		if(this.cursors.left.isDown) this.me.body.setAccelerationX(-this.D_ACCELERATION);
		else if(this.cursors.right.isDown) this.me.body.setAccelerationX(this.D_ACCELERATION);
		else this.me.body.setAccelerationX(0);

		let closest = null, closestDistance = null, actionable = false;

		for(let i = 0; i < this.korpi.getLength(); i++) {
			let dist = this.me.body.center.distance(this.korpi.getChildren()[i].body.center);
			if(dist < this.D_HALO_RADIUS && (closestDistance == null || dist < closestDistance)) {
				closest = this.korpi.getChildren()[i];
				closestDistance = dist;
			}
		}

		this.halos.clear();
		if(closest != null) {
			let closiness = 1 - closestDistance / this.D_HALO_RADIUS;
			this.me.body.setMaxSpeed((this.D_MAXSPEED - this.D_MAXSPEED_MIN) * (1 - closiness) + this.D_MAXSPEED_MIN);
			if(closestDistance <= this.D_ACTION_RADIUS) actionable = true;
			this.drawHalo(this.me, closest, actionable);
		}

		if(actionable) {
			if (Phaser.Input.Keyboard.JustDown(this.keyR)) this.rangeln(this.me, closest);
			else if (Phaser.Input.Keyboard.JustDown(this.keyH)) this.hug(this.me, closest);
		}
	}

	drawHalo(a, b, ring, alarm) {
		let d = a.body.center.distance(b.body.center);
		let closiness = 1 - d / this.D_HALO_RADIUS;
		this.halos
			.fillStyle(0x555555, closiness)
			.fillCircle(a.body.center.x, a.body.center.y, d / 2)
			.fillCircle(b.body.center.x, b.body.center.y, d / 2);
		if(ring) {
			this.halos
				.lineStyle(alarm ? 5 : 2, alarm ? 0xff0000 : 0xffffff, alarm? 1 : closiness)
				.strokeCircle(a.body.center.x, a.body.center.y, d / 2)
				.strokeCircle(b.body.center.x, b.body.center.y, d / 2);
		}
	}

	hug(a, b) {
		a.body.stop();
		b.body.stop();
		this.inAction = true;

		this.drawHalo(a, b, true, false);

		let t = this;

		var tween = this.tweens.add({
	        targets: [a, b],
	        x: (a.body.center.x + b.body.center.x)/2,
	        y: (a.body.center.y + b.body.center.y)/2,
	        ease: 'Power1',
	        duration: 500,
	        hold: 1000,
	        yoyo: true,
	        repeat: 0,
	        onComplete: function () { t.inAction = false; },
	    });
	}

	rangeln(a, b) {
		a.body.stop();
		b.body.stop();
		this.inAction = true;

		this.drawHalo(a, b, true, true);

		let t = this;

		var tween = this.tweens.add({
	        targets: [a, b],
	        x: (a.body.center.x + b.body.center.x)/2,
	        y: (a.body.center.y + b.body.center.y)/2,
	        ease: 'Power1',
	        duration: 50,
	        yoyo: true,
	        repeat: 3,
	        onComplete: function () { t.inAction = false; },
	    });
	}

	createKorpus(x, y, color, love = 1, anger = 0) {
		let c = this.add.graphics({ x: x, y: y });

		this.paintKorpus(c, color, love, anger);

		this.physics.add.existing(c);
		c.body.setCircle(12, -12, -12);
		this.input.enableDebug(c);
		return c;
	}

	paintKorpus(korpus, color, love, anger) {
		korpus.fillStyle(color);

		// horns
		let r1 = 11, r2 = Math.round(r1 + 3 + 10 * anger), 
			aP = -Math.PI / 4, aD = Math.PI / 6;
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
		c.body.setFriction(this.D_FRICTION, this.D_FRICTION);
		c.body.setDrag(this.D_DRAG, this.D_DRAG);
		return c;
	}
}
