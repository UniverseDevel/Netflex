/*
 * Author: dtrooper
 * Code source location: https://jsfiddle.net/user/dtrooper/fiddles/
 * Small modifications of code: Martin Suchy
 */


var video = null,
    SCREEN_WIDTH = 0,
    SCREEN_HEIGHT = 0,
    mousePos = {
        x: 400,
        y: 300
    },
    canvas = null,
    context = null,
    particles = [],
    rockets = [],
    MAX_PARTICLES = 400,
    colorCode = 0,
    counter = 0,
    int_launch = null,
    int_loop = null,
    launch_interval = 1500,
    launch_limit = 10000,
    ending = false,
    auto = false,
    running = false;

// Auto init
/**-/
$(document).ready(function() {
    fireworks_init();
    auto = true;
});
/**/

// Trigger init
/**/
$(document).ready(function() {
    find_fireworks_mark();
});
/**/

function create_fireworks_mark() {
    var mark = document.createElement('span');
    mark.setAttribute('id', 'start_fireworks');
    document.body.appendChild(mark);
}

function find_fireworks_mark() {
    var mark = document.getElementById('start_fireworks');
    var vid = object_handler('player_video', null);
    if (mark && vid) {
        if (running) {
            mark.remove();
        } else {
            fireworks_init();
            mark.remove();
        }
    }
    setTimeout(find_fireworks_mark, 1000);
}

function fireworks_init() {
    log('output', '', getLang('fireworks_start'));
    running = true;

    video_container = object_handler('player_video_container', null);
    SCREEN_WIDTH = video_container.offsetWidth;
    SCREEN_HEIGHT = video_container.offsetHeight;
    /*video = object_handler('player_video', null);
    SCREEN_WIDTH = video.offsetWidth;
    SCREEN_HEIGHT = video.offsetHeight;*/

    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    canvas.setAttribute('id', 'fireworks_canvas');
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '1';
    canvas.style.top = '0px';
    canvas.style.left = '0px';
    canvas.style.borderWidth  = '0px';
    document.body.appendChild(canvas);

    int_launch = setInterval(launch, launch_interval);
    int_loop = setInterval(loop, 1000 / 50);

    // update mouse position
    $(canvas).mousemove(function(e) {
        e.preventDefault();
        mousePos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    // launch more rockets!!!
    $(canvas).mousedown(function(e) {
        for (var i = 0; i < 4; i++) {
            launchFrom(Math.random() * SCREEN_WIDTH * 2 / 3 + SCREEN_WIDTH / 6);
        }
    });
}

function launch() {
    try {
        launchFrom(mousePos.x);
        counter++;
        if ((counter * launch_interval) > launch_limit && !ending && !auto) {
            ending = true;
            $(canvas).fadeOut(1500, function() {
                counter = 0;
                particles = [];
                rockets = [];
                clearInterval(int_launch);
                clearInterval(int_loop);
                $(canvas).remove();
                canvas = null;
                context = null;
                ending = false;
                running = false;
            });
        }
    } catch (e) {}
}

function launchFrom(x) {
    try {
        if (rockets.length < 6) {
            var rocket = new Rocket(x);
            rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
            rocket.vel.y = Math.random() * -3 - 4;
            rocket.vel.x = Math.random() * 6 - 3;
            rocket.size = 8;
            rocket.shrink = 0.999;
            rocket.gravity = 0.01;
            rockets.push(rocket);
        }
    } catch (e) {}
}

function loop() {
    try {
        // update screen size
        video_container = object_handler('player_video_container', null);
        if (SCREEN_WIDTH != video_container.offsetWidth) {
            canvas.width = SCREEN_WIDTH = video_container.offsetWidth;
        }
        if (SCREEN_HEIGHT != video_container.offsetHeight) {
            canvas.height = SCREEN_HEIGHT = video_container.offsetHeight;
        }
        /*video = object_handler('player_video', null);
        if (SCREEN_WIDTH != video.offsetWidth) {
            canvas.width = SCREEN_WIDTH = video.offsetWidth;
        }
        if (SCREEN_HEIGHT != video.offsetHeight) {
            canvas.height = SCREEN_HEIGHT = video.offsetHeight;
        }*/

        // clear canvas
        context.fillStyle = "rgba(0, 0, 0, 0.00)";
        context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        updateRockets();

        updateFireworks();
    } catch (e) {}
}

function updateRockets() {
    var existingRockets = [];

    for (var i = 0; i < rockets.length; i++) {
        // update and render
        rockets[i].update();
        rockets[i].render(context);

        addSmoke(rockets[i].pos);

        // calculate distance with Pythagoras
        var distance = Math.sqrt(Math.pow(mousePos.x - rockets[i].pos.x, 2) + Math.pow(mousePos.y - rockets[i].pos.y, 2));

        // random chance of 1% if rockets is above the middle
        var randomChance = rockets[i].pos.y < (SCREEN_HEIGHT * 2 / 3) ? (Math.random() * 100 <= 1) : false;

        if (rockets[i].pos.y < SCREEN_HEIGHT / 3 || randomChance) {
            rockets[i].resistance = 0.98;
        }

        // Explosion rules: 1 - going down 2- close to the mouse
        if (rockets[i].pos.y < SCREEN_HEIGHT / 6 || Math.abs(rockets[i].vel.y) <= 1 || distance < 30) {
            rockets[i].explode();
        } else {
            existingRockets.push(rockets[i]);
        }
    }

    rockets = existingRockets;
}

function updateFireworks() {
    var existingParticles = [];

    for (var i = 0; i < particles.length; i++) {
        particles[i].update();

        // render and save particles that can be rendered
        if (particles[i].exists()) {
            particles[i].render(context);
            existingParticles.push(particles[i]);
        }
    }

    // update array with existing particles - old particles should be garbage collected
    particles = existingParticles;

    while (particles.length > MAX_PARTICLES) {
        particles.shift();
    }
}

function addSmoke(pos) {
    if (Math.random() < 0.6) {
        var smoke = new Smoke(pos);
        smoke.vel.x = Math.random() * 1 - 0.5;
        particles.push(smoke);
    }
}

function Particle(pos) {
    this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    this.vel = {
        x: 0,
        y: 0
    };
    this.shrink = .97;
    this.size = 2;

    this.resistance = 1;
    this.gravity = 0;

    this.flick = false;

    this.alpha = 1;
    this.fade = 0;
    this.color = 0;
}

Particle.prototype.update = function() {
    // apply resistance
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;

    // gravity down
    this.vel.y += this.gravity;

    // update position based on speed
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // shrink
    this.size *= this.shrink;

    // fade out
    this.alpha -= this.fade;
};

Particle.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
};

Particle.prototype.exists = function() {
    return this.alpha >= 0.1 && this.size >= 1;
};

function Rocket(x) {
    Particle.apply(this, [{
        x: x,
        y: SCREEN_HEIGHT}]);

    this.explosionColor = 0;
}

Rocket.prototype = new Particle();
Rocket.prototype.constructor = Rocket;

Rocket.prototype.explode = function() {

    // decide explosion shape for this rocket
    var explosionFunction;
    switch (Math.floor(Math.random() * 4)) {
    case 0:
        explosionFunction = heartShape;
        break;
    case 1:
        explosionFunction = starShape;
        break;
    default:
        explosionFunction = sphereShape;
    }

    // number of particles to be generated
    var count = Math.random() * 10 + 70;

    // create particles
    for (var i = 0; i < count; i++) {
        var particle = new Particle(this.pos);

        // delegate to a random chosen function
        particle.vel = explosionFunction();

        particle.size = 10;

        particle.gravity = 0.2;
        particle.resistance = 0.92;
        particle.shrink = Math.random() * 0.05 + 0.93;

        particle.flick = true;
        particle.color = this.explosionColor;

        particles.push(particle);
    }
};

Rocket.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    c.fillStyle = "rgb(255, 200, 0)"; // orange
    c.beginPath();

    // draw several particles for each rocket position
    for (var i = 0; i < 5; i++) {
        var angle = Math.random() * Math.PI * 2,
            pos = Math.random() * this.size / 2; // use size like radius
        // draw several 1px particles
        c.arc(this.pos.x + Math.cos(angle) * pos, this.pos.y + Math.sin(angle) * pos, 1.2, 0, Math.PI * 2, true);
    }
    c.closePath();
    c.fill();

    c.restore();
};

function Smoke(pos) {
    Particle.apply(this, [pos]);
    this.size = 1;
    this.vel.x = Math.random() * 0.01;
    this.vel.y = Math.random() * 0.01;
    this.gravity = -0.2;
    this.resistance = 0.01;
    this.shrink = 1.03;
    this.fade = Math.random() * 0.03 + 0.02;
    this.alpha = 1;
    this.start = 0;
}

Smoke.prototype = new Particle();
Smoke.prototype.constructor = Smoke;

Smoke.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositionOperation = "lighter";

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(200, 200, 200," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(150, 150, 150 ," + this.alpha + ")");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2, true);
    c.lineTo(this.pos.x, this.pos.y);
    c.closePath();
    c.fill();

    c.restore();
}

Particle.prototype.exists = function() {
    return this.alpha >= 0.01;
};

function sphereShape() {
    var angle = Math.random() * Math.PI * 2;

    // emulate 3D effect by using cosine and put more particles in the middle
    var speed = Math.cos(Math.random() * Math.PI / 2) * 11;

    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

function starShape() {
    var angle = Math.random() * Math.PI * 2;
    // sin(5*r) creates a star, need to add PI to rotate 180 degrees
    var speed = Math.sin(5 * angle + Math.PI) * 9 + Math.random() * 3;

    return {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
    };
}

function heartShape() {
    var angle = Math.random() * Math.PI * 2;

    var speed = Math.random() * 0.2 + 0.5;

    // invert y speed to display heart in the right orientation
    return {
        x: (16 * Math.pow(Math.sin(angle), 3)) * speed,
        y: (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * -speed
    };
}

// To shut Firefox up, keep it a last line
undefined;