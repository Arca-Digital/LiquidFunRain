'use strict';

const PICTURE_FILENAME = "img/photo1.png";
const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 460;
const METER = 100;

var sprites;
var world;

var meterToPixel = (mx) => mx*METER;
var pixelToMeter = (px) => px/METER;

function createParticleGroup() {
    var psd = new b2ParticleSystemDef();
    psd.radius = 0.025;
    psd.dampingStrength = 0.2;
    var particleSystem = world.CreateParticleSystem(psd);
    var box = new b2PolygonShape();
    box.SetAsBoxXYCenterAngle(
        1.25, 1.25,
        new b2Vec2(pixelToMeter(WINDOW_WIDTH) / 2, 2.0),
        0
    );
    var particleGroupDef = new b2ParticleGroupDef();
    particleGroupDef.shape = box;
    var particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
}

function CreateBar(body, width, height, offsetX, offsetY) {
	const DENSITY = 5;
	const OFFSET_ANGLE = 0;
	var shape = new b2PolygonShape();
	shape.SetAsBoxXYCenterAngle(
		width,
		height,
		new b2Vec2(offsetX, offsetY),
		OFFSET_ANGLE
	);
	body.CreateFixtureFromShape(shape, DENSITY);
}

function createEnclosure() {
	var bdDef = new b2BodyDef();
    var enclosure = world.CreateBody(bdDef);
	CreateBar(enclosure, pixelToMeter(WINDOW_WIDTH)/2, 0.05,
		pixelToMeter(WINDOW_WIDTH) / 2, pixelToMeter(WINDOW_HEIGHT) + 0.05);
	CreateBar(enclosure, 0.05, pixelToMeter(WINDOW_HEIGHT) / 2,
		-0.05, pixelToMeter(WINDOW_HEIGHT) / 2);
	CreateBar(enclosure, 0.05, pixelToMeter(WINDOW_HEIGHT) / 2,
		pixelToMeter(WINDOW_WIDTH) + 0.05, pixelToMeter(WINDOW_HEIGHT) / 2);
}

function InitializeRainMaker() {
	createEnclosure();
	createParticleGroup();
}

function tick() {
	const TIME_STEP = 1.0 / 30.0;
	const VELOCITY_ITERATIONS = 8;
	const POSITION_ITERATIONS = 3;

    world.Step(TIME_STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);

	let particles = world.particleSystems[0].GetPositionBuffer();
    for (var i = 0; i < particles.length / 2; i++)
    {
        let x = meterToPixel(particles[i * 2]);
        let y = WINDOW_HEIGHT - meterToPixel(particles[(i * 2) + 1]);
		sprites[i].x = x;
		sprites[i].y = WINDOW_HEIGHT - y;
    }
}

(function init(divName) {
	// define gravity in LiquidFun and initialize world
    let gravity = new b2Vec2(0, 10);
    world = new b2World(gravity);
	
	// create minimal phaser.js game:
	sprites = [];
    let game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, divName, {
		preload: () => {
			game.load.image('dot', 'img/particles.png');
			game.load.image('photo', PICTURE_FILENAME);
			InitializeRainMaker();
		},
		create: () => {
			LoadBitmapData(game);
			SetupParticles(game);
		},
		update: () => {
			tick();
		}
	});
}("rain"));

function LoadBitmapData(game)
{
	var bmd = game.make.bitmapData(64, 64);
	bmd.draw('photo', 0,0);
	bmd.update();
	bmd.addToWorld();	// optionally, display it on top-left corner
	return bmd;
}

function SetupParticles(game) {
	var colors = [0xB2D9EE, 0xc6ebEE, 0xaee0EE, 0x9fcfEb, 0xb2f9EE, 0xc6ebEE, 0x6baaFF, 0x9fcfDD, 0x4090EE];
	let particles = world.particleSystems[0].GetPositionBuffer();
	for (let i = 0; i < particles.length/2; i++)
	{
		let x = meterToPixel(particles[i * 2]);
		let y = meterToPixel(particles[(i * 2) + 1]);
		sprites[i] = game.add.sprite(x,y, 'dot');
		sprites[i].anchor.set(0.5, 0.5);

		sprites[i].tint = colors[Math.floor(Math.random()*colors.length)];
		sprites[i].alpha = Math.random()*0.4;
	}
}
