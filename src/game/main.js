var game;             // the game
var tileSize = 100;   // size of each tile, in pixels
var tileTypes = 5;    // different kinds of tiles
var gameArray = [];   // the game array, the board will be stored here
var levelWon = false;   // flag for if the current level has been won yet
var backgroundHeader = 54;

// the current level
var currentLevel = {
  level: 1,
  size: 2
};

// possible types of tiles
var TILE_TYPES = {
  STRAIGHT: 1,
  BEGIN: 2,
  END: 3,
  CURVE: 4,
  CROSS: 5,
  TEE: 6
}

// possible orientations for each tile
var TILE_ORIENTATIONS = {
  STRAIGHT: {
    HORIZONTAL: 0,
    VERTICAL: -90
  },
  CURVE: {
    RIGHT_DOWN: 90,
    LEFT_DOWN: -180,
    RIGHT_UP: 0,
    LEFT_UP: -90
  },
  BEGIN: {
    UP: 90,
    DOWN: -90,
    LEFT: 0,
    RIGHT: -180
  },
  END: {
    UP: 90,
    DOWN: -90,
    LEFT: 0,
    RIGHT: -180
  },
  CROSS: {
    ONLY: 0
  },
  TEE: {
    UP: -180,
    DOWN: 0,
    LEFT: 90,
    RIGHT: 90
  },
  NULL: -1
}

// creation of the game
window.onload = function() {	
	game = new Phaser.Game(508, 508, Phaser.AUTO, 'game');
	game.state.add("PlayGame", playGame);
	game.state.start("PlayGame");
}

var playGame = function(game){}
var fx;

playGame.prototype = {
	preload: function() {
    // preloading the assets
    game.load.image('background', '/assets/images/bg.png');
  
    game.load.image('curve', '/assets/images/curve.png');
		game.load.image('straight', '/assets/images/straight.png');
		game.load.image('begin', '/assets/images/begin.png');
		game.load.image('end', '/assets/images/end.png');
		game.load.image('cross', '/assets/images/cross.png');
    game.load.image('tee', '/assets/images/tee.png');
    
    game.load.image('victory', '/assets/images/victory-banner.png');
    
    game.load.audio('rockmove', '/assets/sounds/rockmove.wav');
	},
	
	create: function() { 
    game.add.sprite(0, 0, 'background');
    fx = game.add.audio('rockmove');
    fx.addMarker('rockmove', 0.2, 1);
		
		levelOne();   // begin with level one
	},
	
	update: function() {
		// check win condition
    checkWon();
	},
	
	render: function() {
		
	}
}


/* below are functions for game logic */
function rotateTile() {
  fx.play('rockmove');
	// rotate tile 90*
  if(this.key == 'cross' || this.key == 'begin') {
    // do nothing
  } else if(this.key == 'straight') {
    if(this.angle == 0) {
      this.angle = -90;
    } else {
      this.angle = 0;
    }
  } else {
    this.angle = (this.angle + 90) % 360;
  }
}

function checkWon() {
  var won = true;
  for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// make sure each tile is facing the correct way
      if(gameArray[i][j].orientation == TILE_ORIENTATIONS.NULL) {
        // do nothing
      } else {
        if(gameArray[i][j].tileSprite.angle != gameArray[i][j].orientation) {
          won = false;
        }
      }
		}
  }
  
  if(won) {
    for(var i = 0; i < currentLevel.size; i++){
  		for(var j = 0; j < currentLevel.size; j++){
  			// add listener and anchor of sprite
        gameArray[i][j].tileSprite.inputEnabled = false;
  		}
    }
    
    // increase level
    currentLevel.level += 1;
    
    // switch to new level
    switch (currentLevel.level) {
      case 2:
        levelTwo();
        break;
      case 3:
        levelThree();
        break;
      case 4:
        levelFour();
        break;
      case 5:
        levelFive();
        break;
      case 6:
        victory();
        break;
      default:
        console.log('level oops');
    }
    
    won = false;
  }
}

function victory() {
  var victory = game.add.sprite(game.world.centerX, game.world.centerY, 'victory');
  victory.alpha = 0;
  victory.anchor.setTo(0.5, 0.5);
  
  game.add.tween(victory).to( { alpha: 1 }, Phaser.Timer.SECOND * 2, Phaser.Easing.Linear.None, true, 0, 1000, true);
}

/* below are setups for each level */
function levelOne() {
  // level size, in tiles, NxN tiles
  currentLevel.size = 2;
	var angles = [0,90,180,270];

  gameArray[0] = [];
  gameArray[1] = [];
  
  gameArray[0][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader, 'curve')
  }
  
  gameArray[0][1] = {
    tileType: TILE_TYPES.BEGIN,
    orientation: TILE_ORIENTATIONS.BEGIN.LEFT,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader, 'begin')
  }
  
  gameArray[1][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][1] = {
    tileType: TILE_TYPES.END,
    orientation: TILE_ORIENTATIONS.END.LEFT,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize, 'end')
  }
	
	for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// add listener and anchor of sprite
      var sprite = gameArray[i][j].tileSprite;
      
      if(sprite.key != 'begin') {
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
      }
      
			sprite.events.onInputDown.add(rotateTile, sprite);
			sprite.anchor.setTo(0.5, 0.5);
      
      if(sprite.key == 'begin') {
        sprite.angle = TILE_ORIENTATIONS.BEGIN.LEFT;
      } else {
        sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
        while(sprite.angle == gameArray[i][j].orientation) {
    			sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
        }
      }
    }
  }
}

function levelTwo() {
  // level size, in tiles, NxN tiles
  currentLevel.size = 3;
	var angles = [0,90,180,270];
  var straightAngles = [0,-90];

  gameArray[0] = [];
  gameArray[1] = [];
  gameArray[2] = [];
  
  gameArray[0][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader, 'curve')
  }
  
  gameArray[0][1] = {
    tileType: TILE_TYPES.BEGIN,
    orientation: TILE_ORIENTATIONS.BEGIN.LEFT,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader, 'begin')
  }
  
  gameArray[0][2] = {
    tileType: TILE_TYPES.CROSS,
    orientation: TILE_ORIENTATIONS.CROSS.ONLY,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader, 'cross')
  }
  
  gameArray[1][0] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.VERTICAL,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize, 'straight')
  }
  
  gameArray[1][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[2][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][2] = {
    tileType: TILE_TYPES.END,
    orientation: TILE_ORIENTATIONS.END.UP,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*2, 'end')
  }
	
	for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// add listener and anchor of sprite
      var sprite = gameArray[i][j].tileSprite;
      
      if(sprite.key != 'begin') {
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
      }
      
			sprite.events.onInputDown.add(rotateTile, sprite);
			sprite.anchor.setTo(0.5, 0.5);
      
      if(sprite.key != 'cross') {
        if(sprite.key == 'straight') {
          sprite.angle = straightAngles[game.rnd.between(0,1)];
        } else if(sprite.key == 'begin') {
          sprite.angle = TILE_ORIENTATIONS.BEGIN.LEFT;
        } else {
          sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          while(sprite.angle == gameArray[i][j].orientation) {
      			sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          }
        }
      } else {
        sprite.angle = 0;
      }
    }
  }
}

function levelThree() {
  // level size, in tiles, NxN tiles
  currentLevel.size = 3;
	var angles = [0,90,180,270];
  var straightAngles = [0,-90];

  gameArray[0] = [];
  gameArray[1] = [];
  gameArray[2] = [];
  
  gameArray[0][0] = {
    tileType: TILE_TYPES.BEGIN,
    orientation: TILE_ORIENTATIONS.BEGIN.DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader, 'begin')
  }
  
  gameArray[0][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader, 'curve')
  }
  
  gameArray[0][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader, 'curve')
  }
  
  gameArray[1][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][1] = {
    tileType: TILE_TYPES.CROSS,
    orientation: TILE_ORIENTATIONS.CROSS.ONLY,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize, 'cross')
  }
  
  gameArray[1][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[2][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][1] = {
    tileType: TILE_TYPES.END,
    orientation: TILE_ORIENTATIONS.END.UP,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*2, 'end')
  }
  
  gameArray[2][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*2, 'curve')
  }
	
	for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// add listener and anchor of sprite
      var sprite = gameArray[i][j].tileSprite;
      
      if(sprite.key != 'begin') {
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
      }
      
			sprite.events.onInputDown.add(rotateTile, sprite);
			sprite.anchor.setTo(0.5, 0.5);
      
      if(sprite.key != 'cross') {
        if(sprite.key == 'straight') {
          sprite.angle = straightAngles[game.rnd.between(0,1)];
        } else if(sprite.key == 'begin') {
          sprite.angle = TILE_ORIENTATIONS.BEGIN.DOWN;
        } else {
          sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          while(sprite.angle == gameArray[i][j].orientation) {
      			sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          }
        }
      } else {
        sprite.angle = 0;
      }
    }
  }
}

function levelFour() {
  // level size, in tiles, NxN tiles
  currentLevel.size = 4;
	var angles = [0,90,180,270];
  var straightAngles = [0,-90];

  gameArray[0] = [];
  gameArray[1] = [];
  gameArray[2] = [];
  gameArray[3] = [];
  
  gameArray[0][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(54, backgroundHeader, 'curve')
  }
  
  gameArray[0][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader, 'curve')
  }
  
  gameArray[0][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader, 'curve')
  }
  
  gameArray[0][3] = {
    tileType: TILE_TYPES.BEGIN,
    orientation: TILE_ORIENTATIONS.BEGIN.DOWN,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader, 'begin')
  }
  
  gameArray[1][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][3] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[2][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][1] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*2, 'straight')
  }
  
  gameArray[2][2] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*2, 'straight')
  }
  
  gameArray[2][3] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize*2, 'curve')
  }
  
  
  gameArray[3][0] = {
    tileType: TILE_TYPES.END,
    orientation: TILE_ORIENTATIONS.END.RIGHT,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*3, 'end')
  }
  
  gameArray[3][1] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*3, 'straight')
  }
  
  gameArray[3][2] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*3, 'straight')
  }
  
  gameArray[3][3] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize*3, 'curve')
  }
	
	for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// add listener and anchor of sprite
      var sprite = gameArray[i][j].tileSprite;
      
      if(sprite.key != 'begin') {
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
      }
      
			sprite.events.onInputDown.add(rotateTile, sprite);
			sprite.anchor.setTo(0.5, 0.5);
      
      if(sprite.key != 'cross') {
        if(sprite.key == 'straight') {
          sprite.angle = straightAngles[game.rnd.between(0,1)];
        } else if(sprite.key == 'begin') {
          sprite.angle = TILE_ORIENTATIONS.BEGIN.DOWN;
        } else {
          sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          while(sprite.angle == gameArray[i][j].orientation) {
      			sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          }
        }
      } else {
        sprite.angle = 0;
      }
    }
  }
}

function levelFive() {
  // level size, in tiles, NxN tiles
  currentLevel.size = 5;
	var angles = [0,90,180,270];
  var straightAngles = [0,-90];

  gameArray[0] = [];
  gameArray[1] = [];
  gameArray[2] = [];
  gameArray[3] = [];
  gameArray[4] = [];
  
  gameArray[0][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(54, backgroundHeader, 'curve')
  }
  
  gameArray[0][1] = {
    tileType: TILE_TYPES.BEGIN,
    orientation: TILE_ORIENTATIONS.BEGIN.DOWN,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader, 'begin')
  }
  
  gameArray[0][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader, 'curve')
  }
  
  gameArray[0][3] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader, 'curve')
  }
  
  gameArray[0][4] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(tileSize*4+54, backgroundHeader, 'curve')
  }
  
  gameArray[1][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][1] = {
    tileType: TILE_TYPES.CROSS,
    orientation: TILE_ORIENTATIONS.CROSS.ONLY,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize, 'cross')
  }
  
  gameArray[1][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[1][3] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.VERTICAL,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize, 'straight')
  }
  
  gameArray[1][4] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.NULL,
    tileSprite: game.add.sprite(tileSize*4+54, backgroundHeader+tileSize, 'curve')
  }
  
  gameArray[2][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][1] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[2][3] = {
    tileType: TILE_TYPES.CROSS,
    orientation: TILE_ORIENTATIONS.CROSS.ONLY,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize*2, 'cross')
  }
  
  gameArray[2][4] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_DOWN,
    tileSprite: game.add.sprite(tileSize*4+54, backgroundHeader+tileSize*2, 'curve')
  }
  
  gameArray[3][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_DOWN,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*3, 'curve')
  }
  
  gameArray[3][1] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*3, 'straight')
  }
  
  gameArray[3][2] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*3, 'curve')
  }
  
  gameArray[3][3] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.VERTICAL,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize*3, 'straight')
  }
  
  gameArray[3][4] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.VERTICAL,
    tileSprite: game.add.sprite(tileSize*4+54, backgroundHeader+tileSize*3, 'straight')
  }
  
  gameArray[4][0] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(54, backgroundHeader+tileSize*4, 'curve')
  }
  
  gameArray[4][1] = {
    tileType: TILE_TYPES.STRAIGHT,
    orientation: TILE_ORIENTATIONS.STRAIGHT.HORIZONTAL,
    tileSprite: game.add.sprite(tileSize+54, backgroundHeader+tileSize*4, 'straight')
  }
  
  gameArray[4][2] = {
    tileType: TILE_TYPES.END,
    orientation: TILE_ORIENTATIONS.END.LEFT,
    tileSprite: game.add.sprite(tileSize*2+54, backgroundHeader+tileSize*4, 'end')
  }
  
  gameArray[4][3] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.RIGHT_UP,
    tileSprite: game.add.sprite(tileSize*3+54, backgroundHeader+tileSize*4, 'curve')
  }
  
  gameArray[4][4] = {
    tileType: TILE_TYPES.CURVE,
    orientation: TILE_ORIENTATIONS.CURVE.LEFT_UP,
    tileSprite: game.add.sprite(tileSize*4+54, backgroundHeader+tileSize*4, 'curve')
  }
	
	for(var i = 0; i < currentLevel.size; i++){
		for(var j = 0; j < currentLevel.size; j++){
			// add listener and anchor of sprite
      var sprite = gameArray[i][j].tileSprite;
      
      if(sprite.key != 'begin') {
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;
      }
      
			sprite.events.onInputDown.add(rotateTile, sprite);
			sprite.anchor.setTo(0.5, 0.5);
      
      if(sprite.key != 'cross') {
        if(sprite.key == 'straight') {
          sprite.angle = straightAngles[game.rnd.between(0,1)];
        } else if(sprite.key == 'begin') {
          sprite.angle = TILE_ORIENTATIONS.BEGIN.DOWN;
        } else {
          sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          while(sprite.angle == gameArray[i][j].orientation) {
      			sprite.angle = angles[game.rnd.between(0,3)];	// randomize angle
          }
        }
      } else {
        sprite.angle = 0;
      }
    }
  }
}
