import { Vector2 } from './vector.mjs';
export const SERVER_PORT = 6970;
export const PLAYER_SIZE = 0.5;
export const PLAYER_SPEED = 2;
export var Moving;
(function (Moving) {
    Moving[Moving["MovingForward"] = 0] = "MovingForward";
    Moving[Moving["MovingBackward"] = 1] = "MovingBackward";
    Moving[Moving["TurningLeft"] = 2] = "TurningLeft";
    Moving[Moving["TurningRight"] = 3] = "TurningRight";
    Moving[Moving["Count"] = 4] = "Count";
})(Moving || (Moving = {}));
export var MessageKind;
(function (MessageKind) {
    MessageKind[MessageKind["Hello"] = 0] = "Hello";
    MessageKind[MessageKind["PlayerJoined"] = 1] = "PlayerJoined";
    MessageKind[MessageKind["PlayerLeft"] = 2] = "PlayerLeft";
    MessageKind[MessageKind["PlayerMoving"] = 3] = "PlayerMoving";
    MessageKind[MessageKind["AmmaMoving"] = 4] = "AmmaMoving";
    MessageKind[MessageKind["Ping"] = 5] = "Ping";
    MessageKind[MessageKind["Pong"] = 6] = "Pong";
})(MessageKind || (MessageKind = {}));
export const UINT8_SIZE = 1;
export const UINT16_SIZE = 2;
export const UINT32_SIZE = 4;
export const FLOAT32_SIZE = 4;
function allocUint8Field(allocator) {
    const offset = allocator.size;
    const size = UINT8_SIZE;
    allocator.size += size;
    return {
        offset,
        size,
        read: (view) => view.getUint8(offset),
        write: (view, value) => view.setUint8(offset, value)
    };
}
function allocUint16Field(allocator) {
    const offset = allocator.size;
    const size = UINT16_SIZE;
    allocator.size += size;
    return {
        offset,
        size,
        read: (view) => view.getUint16(offset),
        write: (view, value) => view.setUint16(offset, value)
    };
}
function allocUint32Field(allocator) {
    const offset = allocator.size;
    const size = UINT32_SIZE;
    allocator.size += size;
    return {
        offset,
        size,
        read: (view) => view.getUint32(offset, true),
        write: (view, value) => view.setUint32(offset, value, true)
    };
}
function allocFloat32Field(allocator) {
    const offset = allocator.size;
    const size = FLOAT32_SIZE;
    allocator.size += size;
    return {
        offset,
        size,
        read: (view) => view.getFloat32(offset, true),
        write: (view, value) => view.setFloat32(offset, value, true)
    };
}
function verifier(kindField, kind, size) {
    return (view) => view.byteLength == size &&
        kindField.read(view) == kind;
}
export const PingStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const timestamp = allocUint32Field(allocator);
    const size = allocator.size;
    const verify = verifier(kind, MessageKind.Ping, size);
    return { kind, timestamp, size, verify };
})();
export const PongStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const timestamp = allocUint32Field(allocator);
    const size = allocator.size;
    const verify = verifier(kind, MessageKind.Pong, size);
    return { kind, timestamp, size, verify };
})();
export const HelloStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const id = allocUint32Field(allocator);
    const x_ = allocFloat32Field(allocator);
    const y_ = allocFloat32Field(allocator);
    const direction = allocFloat32Field(allocator);
    const hue = allocUint8Field(allocator);
    const size = allocator.size;
    const verify = verifier(kind, MessageKind.Hello, size);
    return { kind, id, x_, y_, direction, hue, size, verify };
})();
export const AmmaMovingStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const direction = allocUint8Field(allocator);
    const start = allocUint8Field(allocator);
    const size = allocator.size;
    const verify = verifier(kind, MessageKind.AmmaMoving, size);
    return { kind, direction, start, size, verify };
})();
export const PlayerStruct = (() => {
    const allocator = { size: 0 };
    const id = allocUint32Field(allocator);
    const x_ = allocFloat32Field(allocator);
    const y_ = allocFloat32Field(allocator);
    const direction = allocFloat32Field(allocator);
    const hue = allocUint8Field(allocator);
    const moving = allocUint8Field(allocator);
    const size = allocator.size;
    return { id, x_, y_, direction, hue, moving, size };
})();
export const PlayersJoinedHeaderStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const size = allocator.size;
    const itemSize = PlayerStruct.size;
    const verify = (view) => view.byteLength >= size &&
        (view.byteLength - size) % itemSize === 0 &&
        kind.read(view) == MessageKind.PlayerJoined;
    const count = (view) => (view.byteLength - size) / itemSize;
    return { kind, count, size, verify };
})();
export const PlayersMovingHeaderStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const size = allocator.size;
    const itemSize = PlayerStruct.size;
    const verify = (view) => view.byteLength >= size &&
        (view.byteLength - size) % itemSize === 0 &&
        kind.read(view) == MessageKind.PlayerMoving;
    const count = (view) => (view.byteLength - size) / itemSize;
    return { kind, count, size, verify };
})();
export const PlayersLeftHeaderStruct = (() => {
    const allocator = { size: 0 };
    const kind = allocUint8Field(allocator);
    const headerSize = allocator.size;
    const itemSize = UINT32_SIZE;
    const items = (index) => {
        return {
            id: {
                read: (view) => view.getUint32(headerSize + index * itemSize, true),
                write: (view, value) => view.setUint32(headerSize + index * itemSize, value, true)
            }
        };
    };
    const verify = (view) => view.byteLength >= headerSize &&
        (view.byteLength - headerSize) % itemSize === 0 &&
        kind.read(view) === MessageKind.PlayerLeft;
    const allocateAndInit = (countItems) => {
        const buffer = new ArrayBuffer(headerSize + itemSize * countItems);
        const view = new DataView(buffer);
        kind.write(view, MessageKind.PlayerLeft);
        return view;
    };
    const count = (view) => (view.byteLength - headerSize) / itemSize;
    return { kind, count, items, itemSize, headerSize, verify, allocateAndInit };
})();
function properMod(a, b) {
    return (a % b + b) % b;
}
export function sceneContains(scene, p) {
    return 0 <= p.x && p.x < scene.width && 0 <= p.y && p.y < scene.height;
}
export function sceneGetTile(scene, p) {
    if (!sceneContains(scene, p))
        return false;
    return scene.walls[Math.floor(p.y) * scene.width + Math.floor(p.x)];
}
export function sceneCanRectangleFitHere(scene, px, py, sx, sy) {
    const x1 = Math.floor(px - sx * 0.5);
    const x2 = Math.floor(px + sx * 0.5);
    const y1 = Math.floor(py - sy * 0.5);
    const y2 = Math.floor(py + sy * 0.5);
    for (let x = x1; x <= x2; ++x) {
        for (let y = y1; y <= y2; ++y) {
            if (sceneGetTile(scene, new Vector2(x, y))) {
                return false;
            }
        }
    }
    return true;
}
export function createScene(walls) {
    const scene = {
        height: walls.length,
        width: Number.MIN_VALUE,
        walls: [],
    };
    for (let row of walls) {
        scene.width = Math.max(scene.width, row.length);
    }
    for (let row of walls) {
        scene.walls = scene.walls.concat(row);
        for (let i = 0; i < scene.width - row.length; ++i) {
            scene.walls.push(false);
        }
    }
    return scene;
}
export const SCENE = createScene([
    [false, false, true, true, true, false, false],
    [false, false, false, false, false, true, false],
    [true, false, false, false, false, true, false],
    [true, false, false, false, false, true, false],
    [true],
    [false, true, true, true, false, false, false],
    [false, false, false, false, false, false, false],
]);
export function updatePlayer(player, scene, deltaTime) {
    const controlVelocity = new Vector2();
    let angularVelocity = 0.0;
    if ((player.moving >> Moving.MovingForward) & 1) {
        controlVelocity.add(new Vector2().setPolar(player.direction, PLAYER_SPEED));
    }
    if ((player.moving >> Moving.MovingBackward) & 1) {
        controlVelocity.sub(new Vector2().setPolar(player.direction, PLAYER_SPEED));
    }
    if ((player.moving >> Moving.TurningLeft) & 1) {
        angularVelocity -= Math.PI;
    }
    if ((player.moving >> Moving.TurningRight) & 1) {
        angularVelocity += Math.PI;
    }
    player.direction = player.direction + angularVelocity * deltaTime;
    const nx = player.position.x + controlVelocity.x * deltaTime;
    if (sceneCanRectangleFitHere(scene, nx, player.position.y, PLAYER_SIZE, PLAYER_SIZE)) {
        player.position.x = nx;
    }
    const ny = player.position.y + controlVelocity.y * deltaTime;
    if (sceneCanRectangleFitHere(scene, player.position.x, ny, PLAYER_SIZE, PLAYER_SIZE)) {
        player.position.y = ny;
    }
}
//# sourceMappingURL=common.mjs.map