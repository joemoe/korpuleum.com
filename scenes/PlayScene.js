export default class PlayScene extends Phaser.Scene {
	constructor() {
		super('play');

		this.me = null;
		this.korpi = null;
		this.korpiFromTheOtherSide = {};
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

		this.socket = null;
		this.socketOpen = false;
		this.randomId = null;
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

		this.me = this.makeMe(this.createKorpus(512, 256, "0x" + ((1<<24)*Math.random() | 0).toString(16)));

		//this.cameras.main.setBounds(0, 0, 1024, 512);
		//this.cameras.main.startFollow(this.me);

		this.cursors = this.input.keyboard.createCursorKeys();
		this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

		this.id = Math.round(Math.random() * 1000000).toString(16);
		this.socket = new WebSocket("wss://us-nyc-1.websocket.me/v3/1?api_key=25qjh3ruA1KmjBH9whPrIZWmiQcQTxcDB26vjL7n&notify_self");
		let t = this;
		this.socket.onmessage = function(message) {
			t.updateFromTheOtherSide(JSON.parse(message.data));
		}
		this.socket.onopen = function() {
			t.socket.send(JSON.stringify({
				id: t.id,
				color: t.me.getData('color'),
				x: t.me.body.center.x,
				y: t.me.body.center.y,
				love: t.me.getData("love"),
				rage: t.me.getData("rage")
			}));
			t.socketOpen = true;
			t.time.addEvent({
				delay: 50,
				loop: true,
				callback: function() {
					t.socket.send(JSON.stringify({
						id: t.id,
						color: t.me.getData('color'),
						x: t.me.body.center.x,
						y: t.me.body.center.y,
						love: t.me.getData("love"),
						rage: t.me.getData("rage")
					}));
				}
			});

			t.time.addEvent({
				delay: 500,
				loop: true,
				callback: function() {
					for(let i = 0; i < t.korpi.getChildren().length; i++) {
						let child = t.korpi.getChildren()[i];
						if(t.time.now - child.getData('ping') > 500) {
							t.korpiFromTheOtherSide[child.getData('id')] = false;
							child.destroy();
						}
					}
				}
			})
		}
	}

	updateFromTheOtherSide(data) {
		if(data.id == this.id) return;

		if(!this.korpiFromTheOtherSide[data.id]) {
			let christi = this.createKorpus(
				data.x, data.y, 
				data.color, data.love, data.rage
			);
			christi.setData('id', data.id);
			this.korpi.add(christi);
			this.korpiFromTheOtherSide[data.id] = christi;
			console.log(this.korpiFromTheOtherSide);
		} else {
			this.korpiFromTheOtherSide[data.id].setPosition(data.x, data.y);
		}
		this.korpiFromTheOtherSide[data.id].setData('ping', this.time.now);
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
	        onComplete: function () { t.endAction(a, b, 0.2, -0.2); },
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
	        onComplete: function () { t.endAction(a, b, -0.2, 0.2); },
	    });
	}

	endAction(a, b, loveDelta, rageDelta) {
		this.inAction = false;
		a.setData('love', Math.min(1, Math.max(0, a.getData('love') + loveDelta)));
		a.setData('rage', Math.min(1, Math.max(0, a.getData('rage') + rageDelta)));
		b.setData('love', Math.min(1, Math.max(0, b.getData('love') + loveDelta)));
		b.setData('rage', Math.min(1, Math.max(0, b.getData('rage') + rageDelta)));
		this.paintKorpus(a, a.getData('color'), a.getData('love'), a.getData('rage'));
		this.paintKorpus(b, b.getData('color'), b.getData('love'), b.getData('rage'));
	}

	createKorpus(x, y, color, love = 1, rage = 0, name = "") {
		let c = this.add.graphics({ x: x, y: y });

		this.paintKorpus(c, color, love, rage, name);

		this.physics.add.existing(c);
		c.body.setCircle(12, -12, -12);
		this.input.enableDebug(c);
		c.setData('love', love);
		c.setData('rage', rage);
		c.setData('color', color);
		c.setData('name', name);
		return c;
	}

	paintKorpus(korpus, color, love, rage, name = "") {
		korpus.clear();
		korpus.fillStyle(color);

		// horns
		let r1 = 11, r2 = Math.round(r1 + 3 + 10 * rage), 
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
