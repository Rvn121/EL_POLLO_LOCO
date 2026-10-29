const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

// Small sprites with transparent borders exercise the real pixel collision code.
function sprite(src) {
    const pixels = new Uint8ClampedArray(20 * 20 * 4);
    for (let y = 4; y < 16; y++) {
        for (let x = 4; x < 16; x++) pixels[(y * 20 + x) * 4 + 3] = 255;
    }
    return {
        src, complete: true, naturalWidth: 20, naturalHeight: 20,
        visibleBoundsCalculated: true,
        visibleBounds: { left: 4, top: 4, right: 16, bottom: 16 },
        collisionPixels: pixels
    };
}

function scene(level = 1) {
    const context = vm.createContext({
        Image: class {
            set src(value) {
                Object.defineProperty(this, 'src', { value, writable: true });
                Object.assign(this, sprite(value));
            }
        },
        WorldDrawBase: class {}, Date
    });
    const files = ['drawable-object', 'movable-object', 'endboss', 'world-base'];
    vm.runInContext(files.map(name => fs.readFileSync(path.join(root, 'models', `${name}.class.js`), 'utf8')).join('\n') +
        '\nglobalThis.classes = { Endboss, MovableObject, WorldBase };', context);
    const { Endboss, MovableObject, WorldBase } = context.classes;
    const boss = new Endboss(200, true);
    Object.assign(boss, { hitPhases: true, healthPhases: true, aggressive: level === 2 });
    const player = new MovableObject();
    player.x = 100;
    player.loadImage('player');
    const world = new WorldBase();
    Object.assign(world, {
        character: player, bossUnlocked: true, levelNumber: level,
        statusBar: { setPercentage() {} }
    });
    player.takeDamage = damage => { player.energy -= damage; };
    return { boss, player, world };
}

function advanceUntil(boss, player, condition) {
    for (let tick = 0; tick < 1000; tick++) {
        boss.update(16, player);
        if (condition()) return;
    }
    assert.fail(`Timed out in ${boss.state}/${boss.combatPhase}`);
}

for (const level of [1, 2]) {
    test(`level ${level}: G13-G20 finishes even when Pepe runs out of range`, () => {
        const { boss, player } = scene(level);
        boss.beginAttack(player);
        player.x = -1000;
        const frames = new Set();
        while (boss.state === 'attack') {
            frames.add(path.basename(boss.img.src));
            boss.update(16, player);
        }
        assert.deepEqual([...frames], Array.from({ length: 8 }, (_, i) => `G${i + 13}.png`));
        assert.equal(boss.combatPhase, 'retreat');
    });

    test(`level ${level}: only a visible, forward strike damages Pepe once`, () => {
        const { boss, player, world } = scene(level);
        boss.beginAttack(player);
        for (const frame of [0, 1, 2, 6, 7]) {
            boss.frame = frame;
            world.checkBossAttacks([boss]);
            assert.equal(player.energy, 100);
        }
        boss.frame = 3;
        world.checkBossAttacks([boss]);
        world.checkBossAttacks([boss]);
        boss.frame = 5;
        world.checkBossAttacks([boss]);
        assert.equal(player.energy, 90);
        boss.beginAttack(player);
        boss.frame = 4;
        world.checkBossAttacks([boss]);
        assert.equal(player.energy, 80, 'The next attack can hit a stationary Pepe again');
    });

    test(`level ${level}: distance, transparency, dodging behind and jumping are safe`, () => {
        for (const placement of [{ x: -100 }, { x: 70 }, { x: 340 }, { x: 100, y: -250 }]) {
            const { boss, player, world } = scene(level);
            boss.beginAttack(player);
            boss.frame = 4;
            Object.assign(player, placement);
            world.checkBossAttacks([boss]);
            assert.equal(player.energy, 100, JSON.stringify(placement));
        }
    });

    test(`level ${level}: no damage while walking, retreating, hurt, dead or locked`, () => {
        for (const state of ['walking', 'hurt', 'dead', 'finished']) {
            const { boss, player, world } = scene(level);
            boss.state = state;
            boss.frame = 4;
            world.checkBossAttacks([boss]);
            assert.equal(player.energy, 100);
        }
        const { boss, player, world } = scene(level);
        boss.beginAttack(player);
        boss.frame = 4;
        world.bossUnlocked = false;
        world.checkBossAttacks([boss]);
        assert.equal(player.energy, 100);
    });

    test(`level ${level}: a missed attack never turns to follow Pepe behind the boss`, () => {
        const { boss, player } = scene(level);
        boss.beginAttack(player);
        const direction = boss.direction;
        player.x = 340;
        const x = boss.x;
        boss.update(16, player);
        assert.equal(boss.direction, direction);
        assert.equal(boss.x, x);
        assert.equal(boss.state, 'attack');
    });

    test(`level ${level}: a bottle interrupts the attack with hurt or death`, () => {
        const { boss, player, world } = scene(level);
        boss.beginAttack(player);
        boss.takeBottleHit();
        world.checkBossAttacks([boss]);
        assert.equal(boss.state, 'hurt');
        assert.equal(player.energy, 100);
        boss.energy = 20;
        boss.takeBottleHit();
        advanceUntil(boss, player, () => boss.state === 'finished');
        assert.equal(boss.isDead, true);
    });

    test(`level ${level}: Pepe outruns both charge and attack at every health phase`, () => {
        for (const energy of [100, 80, 60, 40, 20]) {
            const { boss, player } = scene(level);
            Object.assign(boss, { energy, bottleHits: 3, combatPhase: 'charge', phaseRemaining: 3800 });
            player.x = -500;
            const gap = boss.x - player.x;
            for (let tick = 0; tick < 600; tick++) {
                player.x -= 4;
                boss.update(1000 / 60, player);
            }
            assert(boss.x - player.x > gap);
            assert(boss.getAttackSpeed() < 4 / (1000 / 60));
        }
    });
}

test('level one patrols, feints after hit one, and attacks after hit two', () => {
    const { boss, player } = scene(1);
    player.x = -200;
    const directions = new Set();
    for (let tick = 0; tick < 600; tick++) {
        boss.update(16, player);
        directions.add(boss.direction);
        assert.notEqual(boss.state, 'attack');
    }
    assert.equal(directions.size, 2);
    boss.takeBottleHit();
    advanceUntil(boss, player, () => boss.combatPhase === 'retreat');
    advanceUntil(boss, player, () => boss.combatPhase === 'patrol');
    player.x = boss.x - 100;
    boss.takeBottleHit();
    advanceUntil(boss, player, () => boss.state === 'attack');
});

test('level two feints first, then repeatedly attacks and retreats after one hit', () => {
    const { boss, player } = scene(2);
    Object.assign(boss, { combatPhase: 'charge', phaseRemaining: 1800 });
    boss.update(16, player);
    assert.equal(boss.combatPhase, 'retreat');
    boss.takeBottleHit();
    for (let attack = 0; attack < 3; attack++) {
        advanceUntil(boss, player, () => boss.state === 'attack');
        advanceUntil(boss, player, () => boss.combatPhase === 'retreat');
        advanceUntil(boss, player, () => boss.combatPhase === 'charge');
    }
});
