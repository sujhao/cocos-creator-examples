// author: http://lamyoung.com/

const { ccclass, property } = cc._decorator;

@ccclass
export default class Coin extends cc.Component {

    @property
    initial_velocity: cc.Vec2 = cc.v2(0, 0);

    @property
    acceleration: cc.Vec2 = cc.v2(0, -10);

    _initial_position: cc.Vec2 = cc.v2(0, -10);

    onLoad() {
        this._initial_position.x = this.node.x;
        this._initial_position.y = this.node.y;
    }

    private _emiting: boolean = false;
    emitCoin() {
        this._initial_position.x = this.node.x;
        this._initial_position.y = this.node.y;
        this._time = 0;
        this._emiting = true;
    }

    resetCoin() {
        this._emiting = false;
        this._time = 0;
    }


    private _time: number = 0;
    update(dt) {
        if (this._emiting) {
            this._time += dt;
            this.node.x = this._initial_position.x + this.initial_velocity.x * this._time + this.acceleration.x * this._time * this._time / 2;
            this.node.y = this._initial_position.y + this.initial_velocity.y * this._time + this.acceleration.y * this._time * this._time / 2;
        }
    }
}


// 欢迎关注微信公众号[白玉无冰]