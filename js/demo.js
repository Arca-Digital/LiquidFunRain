'use strict';

const PICTURE_FILENAME = "img/photo1.png";
const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 460;
const BOX_OFFSET_X = 2.0;
const BOX_OFFSET_Y = -1.25;
const INITIAL_BAR_X = 2.5;
const INITIAL_BAR_Y = 2.0;
const INITIAL_BAR_ANGLE = 0.15;
const METER = 100;

var sprites;
var world;
var barBody;
var barSprite;

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
        new b2Vec2(BOX_OFFSET_X, BOX_OFFSET_Y),
        0
    );
    var particleGroupDef = new b2ParticleGroupDef();
    particleGroupDef.shape = box;
    var particleGroup = particleSystem.CreateParticleGroup(particleGroupDef);
}

function CreateBar(barBody, width, height, offsetX, offsetY) {
	const DENSITY = 5;
	const OFFSET_ANGLE = 0;
	var shape = new b2PolygonShape();
	shape.SetAsBoxXYCenterAngle(
		width,
		height,
		new b2Vec2(offsetX, offsetY),
		OFFSET_ANGLE
	);
	barBody.CreateFixtureFromShape(shape, DENSITY);
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
	createInteractiveBar();
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
        let y = meterToPixel(particles[(i * 2) + 1]);
		sprites[i].x = x;
		sprites[i].y = y;
    }
	var p = barBody.GetPosition();
	barSprite.position.set(meterToPixel(p.x), meterToPixel(p.y));
	barSprite.rotation = barBody.GetAngle();
}

function LoadBitmapData(game)
{
	let bmd = game.make.bitmapData(64, 64);
	bmd.draw('photo', 0,0);
	bmd.update();
	return bmd;
}

function SetupParticles(game, bmd) {
	let particles = world.particleSystems[0].GetPositionBuffer();
	for (let i = 0; i < particles.length/2; i++)
	{
		let x = meterToPixel(particles[i * 2]);
		let y = meterToPixel(particles[(i * 2) + 1]);
		sprites[i] = game.add.sprite(x,y, 'dot');
		sprites[i].anchor.set(0.5, 0.5);

		let x0 = Math.floor( (x - meterToPixel(BOX_OFFSET_X - 1.25))/250 * bmd.width );
		let y0 = Math.floor( (y - meterToPixel(BOX_OFFSET_Y - 1.25))/250 * bmd.height);
		let color = bmd.getPixelRGB(x0, y0);
		sprites[i].tint = color.r *0x10000+ color.g*0x100 + color.b;
	}
}

function createInteractiveBar() {
	var bd = new b2BodyDef();
	bd.type = b2_dynamicBody;
	barBody = world.CreateBody(bd);
	CreateBar(barBody, 0.1, 1, 0, 0);
	// Move it to initial position, leaning a bit so that it will ultimately tip
	barBody.SetTransform(new b2Vec2(INITIAL_BAR_X, INITIAL_BAR_Y), INITIAL_BAR_ANGLE);
}

function SetupBarSprite(game) {
	var p = barBody.GetPosition();
	barSprite = game.add.sprite(meterToPixel(p.x), meterToPixel(p.y), 'bar');
	barSprite.anchor.set(0.5, 0.5);
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
			game.load.image('bar', 'img/bar.png');
			InitializeRainMaker();
		},
		create: () => {
			let bitmapData = LoadBitmapData(game);
			SetupParticles(game, bitmapData);
			SetupBarSprite(game);
		},
		update: () => {
			tick();
		}
	});
}("rain"));
