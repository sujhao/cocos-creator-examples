
const { ccclass, property } = cc._decorator;

enum EnumChararerDir {
    none = 0,
    left,
    right,
    up,
    down
}

@ccclass
export default class charaterItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null;

    @property([cc.SpriteFrame])
    spriteFrames: cc.SpriteFrame[] = [];

    private _spriteFrames: cc.SpriteFrame[][] = [];

    onLoad() {
        for (let index = 0; index < this.spriteFrames.length; index++) {
            const element = this.spriteFrames[index];
            this._spriteFrames[index] = [];
            for (let index2 = 0; index2 < 12; index2++) {
                this._spriteFrames[index][index2] = element.clone();
                this._spriteFrames[index][index2].setRect(cc.rect(16 * Math.floor(index2 / 3), 32 * (index2 % 3), 16, 32));
            }
        }
    }

    private _img_type = 0;
    private _minX = 0;
    private _minY = 0;
    private _maxX = 0;
    private _maxY = 0;

    init(parent: cc.Node, minX: number, maxX: number, minY: number, maxY: number) {
        if (this.node.parent !== parent) {
            this.node.removeFromParent();
            parent.addChild(this.node);
        }
        this._minX = minX;
        this._maxX = maxX;
        this._minY = minY;
        this._maxY = maxY;
        this.initDir();

    }

    private _dir = EnumChararerDir.none;
    private _step_st = 1;
    private _stpe_count = 0;
    private moveOneStep() {
        // cc.log(`moveOneStep ${this._dir} this.node.x${this.node.x} this.node.y${this.node.y} ${this._minX}`)
        switch (this._dir) {
            case EnumChararerDir.none: {
                break;
            }
            case EnumChararerDir.left: {
                this.sp.spriteFrame = this._spriteFrames[this._img_type][[0, 1, 0, 2][this._stpe_count % 4]];
                this.node.x -= 5;
                if (this.node.x < this._minX) {
                    this.initDir();
                    return;
                }
                break;
            }
            case EnumChararerDir.right: {
                this.sp.spriteFrame = this._spriteFrames[this._img_type][[9, 10, 9, 11][this._stpe_count % 4]];
                this.node.x += 5;
                if (this.node.x > this._maxX) {
                    this.initDir();
                    return;
                }
                break;
            }
            case EnumChararerDir.up: {
                this.sp.spriteFrame = this._spriteFrames[this._img_type][[6, 7, 6, 8][this._stpe_count % 4]];
                this.node.y += 5;
                if (this.node.y > this._maxY) {
                    this.initDir();
                    return;
                }
                break;
            }
            case EnumChararerDir.down: {
                this.sp.spriteFrame = this._spriteFrames[this._img_type][[3, 4, 3, 5][this._stpe_count % 4]];
                this.node.y -= 5;
                if (this.node.y < this._minY) {
                    this.initDir();
                    return;
                }
                break;
            }
        }
        this._stpe_count++;
        this.scheduleOnce(() => {
            this.moveOneStep();
        }, this._step_st);
    }

    private initDir() {
        this._dir = Math.floor(2 * Math.random()) + 1;// 1-左 2-右
        this._step_st = 0.1 + Math.random() * 0.04; // 移动一步的时间
        this._stpe_count = 0;
        this._img_type = Math.floor(this._spriteFrames.length * Math.random()); // 随机一个角色
        this.node.y = this._minY + Math.random() * (this._maxY - this._minY);
        this.node.x = this._minX + Math.random() * (this._maxX - this._minX);

        switch (this._dir) {
            case EnumChararerDir.left: {
                this.node.x = this._maxX;
                break;
            }
            case EnumChararerDir.right: {
                this.node.x = this._minX;
                break;
            }
            case EnumChararerDir.up: {
                this.node.y = this._minY;
                break;
            }
            case EnumChararerDir.down: {
                this.node.y = this._maxY;
                break;
            }
        }

        this.node.opacity = 0;
        this.scheduleOnce(() => {
            this.node.opacity = 255;
            this.moveOneStep();
        }, 5 * Math.random())
    }

    onDisable() {
        this.unscheduleAllCallbacks();
    }
}

// 欢迎关注【白玉无冰】公众号