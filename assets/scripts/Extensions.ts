declare namespace cc {
    interface Node {    // tslint:disable-line
        angelTo(point: cc.Vec2): number;
        getWorldPosition(): cc.Vec2;
        getAttr<T>(key: string): T;
    }
    interface Graphics { // tslint:disable-line
        dashedLine(startPos: cc.Vec2, endPos: cc.Vec2, lineLength?: number, spaceLength?: number): void;
    }
    export function assert(cond: boolean, msg?: string): void;
    export function hasScene(sceneName: string): boolean;
    export function randf(minInclusive: number, maxInclusive: number): number;
    export function takeScreenshot(): Promise<string>;
    export function spriteFrameFromBase64(base64: string): Promise<SpriteFrame>;
}

interface Array<T> { // tslint:disable-line
    randOne(): T;
    shuffle(): T[];
    uniq(): T[];
}

interface Number { // tslint:disable-line
    round(decimal): number;
}

Number.prototype.round = function round(this: number, decimal: number): number {
    return Math.round(this * Math.pow(10, decimal)) / Math.pow(10, decimal);
};

Array.prototype.randOne = function <T>(this: T[]): T {
    return this[Math.floor(this.length * Math.random())];
};

Array.prototype.shuffle = function shuffle<T>(this: T[]): T[] {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

Array.prototype.uniq = function shuffle<T>(this: T[]): T[] {
    return this.filter((v, i, a) => a.indexOf(v) === i);
};

cc.Node.prototype.getWorldPosition = function (this: cc.Node) {
    return this.parent.convertToWorldSpaceAR(this.getPosition());
};

cc.Node.prototype.angelTo = function (this: cc.Node, point): number {
    const target = point.sub(this.getWorldPosition());
    const angel = Math.atan2(target.x, target.y);
    return angel * 180 / Math.PI;
};

cc.Node.prototype.getAttr = function <T>(this: cc.Node, key) {
    return this[key] as T;
};

cc.spriteFrameFromBase64 = (base64) => {
    return new Promise<cc.SpriteFrame>((resolve, reject) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const texture = new cc.Texture2D();
            texture.initWithElement(img);
            texture.handleLoadedTexture();
            const newframe = new cc.SpriteFrame(texture);
            resolve(newframe);
        };
    });
};

cc.takeScreenshot = () => {
    return new Promise<string>((resolve, reject) => {
        cc.director.on(cc.Director.EVENT_AFTER_DRAW, () => {
            const base64 = cc.game.canvas.toDataURL();
            cc.director.off(cc.Director.EVENT_AFTER_DRAW);
            resolve(base64);
        });
    });
};

cc.randf = (min, max) => {
    return min + Math.round(max * Math.random());
};

cc.hasScene = (name) => {
    const scenes = cc.game.config.scenes;
    for (const s of scenes) {
        if (s.url.endsWith(name + ".fire")) {
            return true;
        }
    }
    return false;
};

if (cc.Graphics) {
    cc.Graphics.prototype.dashedLine = function (
        this: cc.Graphics,
        startPos,
        endPos,
        lineLength = 10,
        spaceLength = 20) {
        let cursor = startPos;
        let count = 0;
        const direction = endPos.sub(startPos);
        if (direction.mag() < 10) {
            return;
        }
        const increment = direction.normalize();
        while ((endPos.x - cursor.x) * increment.x >= 0 && (endPos.y - cursor.y) * increment.y >= 0) {
            if (count % 2 === 0) {
                this.moveTo(cursor.x, cursor.y);
                cursor = cursor.add(increment.mul(lineLength));

            } else {
                this.lineTo(cursor.x, cursor.y);
                cursor = cursor.add(increment.mul(spaceLength));
            }
            count++;
        }
    };
}
