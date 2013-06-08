
	$(function() {
		console.log('Yo dawg!');
	}); 
    // create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x66FF99);
 
    // create a renderer instance.
    var renderer = PIXI.autoDetectRenderer(400, 300);

    // var texture = PIXI.Texture.fromImage("bunny.png");
    // create a new Sprite using the texture
    var bunny = new PIXI.Rectangle(10,10, 50, 50);
 
    // center the sprites anchor point
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;
 
    // move the sprite t the center of the screen 
    stage.addChild(bunny);
 
 
    // add the renderer view element to the DOM
    document.body.appendChild(renderer.view);
 
    requestAnimFrame( animate );
 
    function animate() {
 
        requestAnimFrame( animate );
 
        // render the stage   
        renderer.render(stage);
    }
