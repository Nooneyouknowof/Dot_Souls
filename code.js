let player = document.getElementById('player');
let boss = document.getElementById('boss');
let screen = document.getElementById('screen');
let fpsElement = document.getElementById('showFPS');
let fx = document.getElementById('fx');
let boss_health = document.getElementById('boss_health_value');
let player_health = document.getElementById('playerHealth');
let end_screen = document.getElementById('game_end');
let obj = document.getElementById('objects');
let ps = Math.round((player.clientWidth/screen.clientWidth)*100)/2;
let bs = Math.round((boss.clientWidth/screen.clientWidth)*100);
let x = 50;
let y = 50;
let ox = x
let oy = y
let px = 0;
let py = 0;
let speed = 1;
let boss_speed = 1;
let stamina = 100;
let health = 100;
let time = Date.now();
let pt = time;
let dt = time;
let isAttacking = false;
let isHurt = false;
let mouseX = 0;
let mouseY = 0;
let damage = 0.1;
let Score = 0;
let bossAttackType = "boss_arrow";
let playername = 'Player1';

let bossObj = {'type': 'boss', 'state': -1, 'damage': 10, 'time': Date.now(), 'x': 50, 'y': 10, 'px': 50, 'py': 10, 'health': 100}
let objects = [];

screen.onmousemove = (event) => {
    mouseX = (event.offsetX/screen.clientWidth)*100;
    mouseY = (event.offsetY/screen.clientHeight)*100;
}

let keyboard = {}
document.addEventListener('keydown', (event) => {
    let key = event.key
    if (key === " ") {key = "SPACE"};
    keyboard[key.toUpperCase()] = true
})

document.addEventListener('keyup', (event) => {
    let key = event.key
    if (key === " ") {key = "SPACE"};
    keyboard[key.toUpperCase()] = false
})

function create(type, damage, x, y, px, py) {
    objects.push({'type': type, 'state': 0, 'damage': damage, 'time': Date.now(), 'x': x, 'y': y, 'px': px, 'py': py, 'size': 5})
}

setInterval(() => {
    fpsElement.textContent = Math.round(Math.pow(dt, -1));
},100);

function squared(arg) {
    return Math.pow(Math.abs(arg),2);
}

function distance(x, y, target_x, target_y) {
    let a = target_x-x;
    let b = target_y-y;
    return Math.sqrt(squared(a)+squared(b));
}

function attack(type, damage, x, y, target_x, target_y) {
    let a = target_x-x;
    let b = target_y-y;
    let c = Math.sqrt(squared(a)+squared(b));
    create(type, damage, x+(a/c*6), y+(b/c*6), x+(a/c*5), y+(b/c*5));
}

let attackrate = 10;
let attacki = 0;
setInterval(() => {
    if (isAttacking) {attacki++}
    if (attacki >= attackrate) {
        attacki = 0;
        attack(bossAttackType, bossObj['damage'], bossObj.x, bossObj.y, x, y);
    }
},100);

let op = 0;
let isPlayerAttack = true;
setInterval(() => {isPlayerAttack = true}, 1000);
function loop() {
    dt = (Date.now()-pt)/1000;
    ox = x;
    oy = y;
    if (keyboard.ESCAPE) {
        keyboard.ESCAPE = false;
        alert('Game is Paused');
    };
    if (keyboard.S) {y += speed};
    if (keyboard.W) {y -= speed};
    if (keyboard.A) {x -= speed};
    if (keyboard.D) {x += speed};
    if (keyboard.X) {isHurt = true};
    if (keyboard.SHIFT) {
        speed = 0.02
        x = x-(px-x)*0.98;
        y = y-(py-y)*0.98;
    } else {speed = 1}

    if (keyboard.SPACE && isPlayerAttack) {
        isPlayerAttack = false;
        attack("arrow", damage, x, y, mouseX, mouseY);
    }
    if (!keyboard.SPACE && !isPlayerAttack) {
        isPlayerAttack = true;
    }

    if (x < ps) {x = ps};
    if (y < ps) {y = ps};
    if (x > (100-ps)) {x = (100-ps)};
    if (y > (100-ps)) {y = (100-ps)};

    if (isHurt) {
        isHurt = false;
        let clone = fx;
        fx.remove();
        clone.style.animation = 'Hurt 1s linear 0s 1 forwards';
        screen.appendChild(clone);
    };
    

    player.style.top = `${y}%`;
    player.style.left = `${x}%`;
    px = ox;
    py = oy;

    time = (Date.now()-bossObj['time']);
    if (bossObj['state'] === -1) {
        op += (dt/5);
        boss.style.opacity = op;
        bossObj['px'] = bossObj['x']-(op/5);
        bossObj['py']= bossObj['y']-(op/5);
        if (op > 1) {
            boss.style.opacity = 1;
            bossObj['state']++;
            bossObj['px'] = bossObj['x']-0.25;
            bossObj['py'] = bossObj['y']-0.25;
            isAttacking = true;
        }
    }
    
    bx = bossObj['x'];
    by = bossObj['y'];
    bossObj['x'] = bossObj['x']-(bossObj['px']-bossObj['x']);
    bossObj['y'] = bossObj['y']-(bossObj['py']-bossObj['y']);
    if (bossObj['x'] < bs) {bx -= 0.1};
    if (bossObj['y'] < bs) {by -= 0.1};
    if (bossObj['x'] > (100-bs)) {bx += 0.1};
    if (bossObj['y'] > (100-bs)) {by += 0.1};
    boss.style.left = `${bossObj['x']}%`;
    boss.style.top = `${bossObj['y']}%`;
    bossObj['px'] = bx;
    bossObj['py'] = by;

    obj.innerHTML = '';
    objects.map((item,index) => {
        let temp = document.createElement('div');
        temp.id = index;
        temp.classList.add(item['type']);

        if (item['type'] == 'arrow') {
            let c = distance(item['x'], item['y'], bx, by);
            if (c < bs*2) {bossObj['health'] -= damage*((bs*2)-c)*dt};
        }
        if (item['type'] == 'boss_arrow' || item['type'] == 'one_shot') {
            let c = distance(x, y, item['x'], item['y']);
            if (c < ps*2) {
                health -= item['damage']*((ps*2)-c)*dt;
                isHurt = true
            };
        }

        bx = item['x'];
        by = item['y'];
        item['x'] = item['x']-(item['px']-item['x']);
        item['y'] = item['y']-(item['py']-item['y']);
        obj.appendChild(temp);
        temp.style.left = `${item['x']}%`;
        temp.style.top = `${item['y']}%`;
        item['px'] = bx;
        item['py'] = by;
        if (item['x'] < -item['size']) {objects.shift()};
        if (item['y'] < -item['size']) {objects.shift()};
        if (item['x'] > (100+item['size'])) {objects.shift()};
        if (item['y'] > (100+item['size'])) {objects.shift()};
    });
    pt = Date.now();
    boss_health.style.width = `${bossObj['health']}%`;
    player_health.textContent = `Health: ${Math.round(health)}`;
    if (bossObj['health'] < 50) {
        attackrate = 1+(bossObj['health']/5);
        bossObj['damage'] = (100-bossObj['health'])/5;
    };
    if (bossObj['health'] < 10) {
        bossObj['damage'] = 100;
        bossAttackType = "one_shot"
    };
    if (bossObj['health'] <= 0) {
        bossAttackType = "none"
        bossObj['health'] = 0;
        isAttacking = false;
        bossObj['px'] = bossObj['x'];
        bossObj['py'] = bossObj['y'];
    };
    if (health > 0 && bossObj['health'] > 0) {
        requestAnimationFrame(loop)
    } else {
        if (health < 0) {health = 0};
        Score = Math.round(Math.pow(((100-bossObj['health'])+health)/2, 2));
        if (localStorage.getItem(playername) != null) {
            if (localStorage.getItem(playername) < Score) {
                localStorage.setItem(playername, Score);
            }
        } else {
            localStorage.setItem(playername, Score);
        }
        document.querySelector("#game_end > h1").innerHTML = `Highscore: ${localStorage.getItem(playername)}<br />Score: ${Score}`;
        end_screen.style.animation = 'fade_in 2s ease-out 0s 1 forwards';
    }
}

let login = document.querySelector("#login");
login.addEventListener('keydown', event => {
    if (event.key == 'Enter') {
        start();
    }
})
function start() {
    playername = document.querySelector("#user").value;
    if (playername != '') {
        login.style.opacity = 0;
        login.style.animation = 'fade_out 2s ease-out 0s 1 forwards';
        loop();
    }
    // console.log(playername.value)
    // localStorage.getItem();
}

// Instructions
console.log("　　　  　　／＞　　フ\n　　　 　  |   _　 _\n　 　　 　／` ミ＿xノ\n　　 　 /　　　 　 |\n　　　 /　 ヽ　　 ﾉ\n　 　 │　　|　|　|\n　／￣|　　 |　|　|\n　| (￣ヽ＿_ヽ_)__)\n　＼二つ\tDot Souls\n\n---=====---\n");
console.log("\tMade by:\n\t\tOctavio McNaughton");
console.log("---=====---\n\nUse 'WASD' to move your character\nUse 'Mouse' to Aim\nUse 'Spacebar' to Shoot\nUse 'LShift' to Slide\nPress 'Ctrl + R' to Restart");
