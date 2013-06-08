// create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x66FF99);

    // create a renderer instance
    var renderer = PIXI.autoDetectRenderer(800, 400);

    // add the renderer view element to the DOM
    document.body.appendChild(renderer.view);
    console.log(renderer);

    requestAnimFrame( animate );

    // create a texture from an image path
    availableControls = new Array([65,68,83,87,70], [37,39,40,38,191]);

    var Player = function(){
        var player = this;
        var controlSchema = availableControls[0];

        this.left = false;
        this.right = false;
        this.up = false;
        this.down = false;

        this.speed = 4;

        this.x = 200;
        this.y = 150;

        this.texture = PIXI.Texture.fromImage("images/bunny.png");
        this.bunny = new PIXI.Sprite(this.texture);


        var move = function(e){
                 console.log(e.keyCode);
                switch(e.keyCode){
                    case controlSchema[0]:
                        player.left = true;
                        // player.x -= player.speed;
                        break;
                    case controlSchema[1]:
                        player.right = true;
                        // player.x += player.speed;
                        break;
                    case controlSchema[2]:
                        player.down = true;
                        // body...
                        break;
                    case controlSchema[3]:
                        player.up = true;
                        // console.log("UP");
                        break;
                    case controlSchema[4]:
                        console.log('Yo dawg!');
                        break;


            }
        }

        var stopMove = function(e){
                 console.log(e.keyCode);
                switch(e.keyCode){
                    case controlSchema[0]:
                        player.left = false;
                        break;
                    case controlSchema[1]:
                        player.right = false;
                        break;
                    case controlSchema[2]:
                        player.down = false;
                        break;
                    case controlSchema[3]:
                        player.up = false;
                        // console.log("UP");
                        break;
                    case controlSchema[4]:
                        console.log('Yo dawg!');
                        break;


            }
        }

        $(document).keydown(function(e) { move(e) });
        $(document).keyup(function(e) { stopMove(e) });

        
    }
    // create a new Sprite using the texture
    var player = new Player();
    // center the sprites anchor point
    player.bunny.anchor.x = 0.5;
    player.bunny.anchor.y = 0.5;

    // move the sprite t the center of the screen
    player.bunny.position.x = 200;
    player.bunny.position.y = 150;

    stage.addChild(player.bunny);

    function animate() {

        requestAnimFrame( animate );

        // just for fun, lets rotate mr rabbit a little
        if (player.left) {
            player.bunny.position.x -= player.speed;
            
        }
        if (player.right) {
            player.bunny.position.x += player.speed;
            
        }if (player.up) {
            player.bunny.position.y -= player.speed;
            
        }if (player.down) {
            player.bunny.position.y += player.speed;
            
        }
        // player.bunny.rotation += 0.1;
        // bunny.position.x += 1.1;

        // render the stage   
        renderer.render(stage);
    }
