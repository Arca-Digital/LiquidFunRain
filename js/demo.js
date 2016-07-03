'use strict';

const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 460;

(function init(divName) {
	// define gravity in LiquidFun and initialize world
    let gravity = new b2Vec2(0, 10);
    let world = new b2World(gravity);
	
	// create minimal phaser.js game:
    let game = new Phaser.Game(WINDOW_WIDTH, WINDOW_HEIGHT, Phaser.AUTO, divName, {
		preload: () => {
		},
		create: () => {			
		},
		update: () => {
		}
	});
}("rain"));
