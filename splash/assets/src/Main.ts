// author: http://lamyoung.com/

const V_X_MIN = -100;
const V_X_MAX = 100;
const V_Y_MIN = 800;
const V_Y_MAX = 1000;

import Coin from "./Coin";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Prefab)
    prefab_coin: cc.Prefab = null;

    @property(cc.Node)
    node_coin_layer: cc.Node = null;

    @property(cc.Toggle)
    toggle_boxmuller: cc.Toggle = null;

    onLoad() {
        this.node_coin_layer.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    private onTouchStart(touch: cc.Event.EventTouch) {
        this.schedule(() => {
            this.emitCoin();
            this.emitCoin();
            this.emitCoin();
        }, 0.03, 50);

        // 清除一下跑出界面外的
        this.node_coin_layer.children.forEach(n => {
            if (n.y < -1000) n.removeFromParent(true);
        })
    }

    private _coinZIndex = cc.macro.MAX_ZINDEX;
    private emitCoin() {
        const node_coin = cc.instantiate(this.prefab_coin);
        const coin = node_coin.getComponent(Coin);
        const random_a = Math.random();
        const random_b = Math.random();
        const isUseBoxmuller = this.toggle_boxmuller.isChecked;

        if (isUseBoxmuller) {
            // 正态分布处理

            // box-muller 算法  r1 = sqrt(-2 * ln a) * sin(2*PI*b)    r2 = sqrt(-2 * ln a) * cos(2*PI*b)
            const boxMuller_r = Math.sqrt(-2 * Math.log(random_a));
            const boxMuller_t = 2 * Math.PI * random_b;
            // 标准正态分布 N~(0,1)  68% 的概率 -1～1   95% 的概率 -2~2
            const random_normal_x = boxMuller_r * Math.cos(boxMuller_t);
            const random_normal_y = boxMuller_r * Math.sin(boxMuller_t);
            // random_normal ==除以4==> 95% 的概率 -0.5～0.5  ==加0.5==> 95% 的概率 0～1
            coin.initial_velocity.x = (random_normal_x / 4 + 0.5) * (V_X_MAX - V_X_MIN) + V_X_MIN;
            coin.initial_velocity.y = (random_normal_y / 4 + 0.5) * (V_Y_MAX - V_Y_MIN) + V_Y_MIN;
        } else {
            // 均匀分布
            coin.initial_velocity.x = random_a * (V_X_MAX - V_X_MIN) + V_X_MIN;
            coin.initial_velocity.y = random_b * (V_Y_MAX - V_Y_MIN) + V_Y_MIN;
        }


        this.node_coin_layer.addChild(node_coin, this._coinZIndex--);

        if (this._coinZIndex < cc.macro.MIN_ZINDEX) {
            this._coinZIndex = cc.macro.MAX_ZINDEX;
        }
        coin.emitCoin();
    }
}

// 欢迎关注微信公众号[白玉无冰]