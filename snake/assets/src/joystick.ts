// JavaScript:
//  - [KuoKuo666] https://github.com/KuoKuo666/MyComponent/blob/master/joystick.js
// Doc:
//  - https://mp.weixin.qq.com/s/XbmMXUuOmSL3IvAPp-ThNQ

const { ccclass, property } = cc._decorator;
@ccclass
export default class Joystick extends cc.Component {
    /** 摇杆移动中心 */
    @property({ type: cc.Node, tooltip: '移动中心节点' })
    midNode: cc.Node = null;
    /** 摇杆背景做监听，体验好些 */
    @property({ type: cc.Node, tooltip: '摇杆背景节点' })
    joyBk: cc.Node = null;
    /** 摇杆最大移动半径 */
    @property({ type: cc.Integer, tooltip: '摇杆活动半径' })
    maxR: number = 100;
    /** 摇杆移动回调 */
    @property({ type: [cc.Component.EventHandler], tooltip: '摇杆移动回调' })
    joyCallBack: cc.Component.EventHandler[] = [];

    onLoad() {
        // 归位
        this.goBackMid();
    }

    start() {
        this.joyBk.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyBk.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 回归中心 */
    goBackMid() {
        // this.joyBk.setPosition(0, 0);
        this.midNode.setPosition(0, 0);
    }

    onTouchStart(e: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        this.clampPos(pos);
        this.midNode.setPosition(pos.x, pos.y);
        let angle = this.covertToAngle(pos);
        // console.log(this.joyCallBack);
        // 触发回调
        this.joyCallBack.forEach(c => c.emit([pos, angle]));
    }

    onTouchMove(e: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(e.getLocation());
        this.clampPos(pos);
        this.midNode.setPosition(pos.x, pos.y);
        let angle = this.covertToAngle(pos);
        // 触发回调
        this.joyCallBack.forEach(c => c.emit([pos, angle]));
    }

    onTouchEnd(e: cc.Event.EventTouch) {
        this.goBackMid();
        this.joyCallBack.forEach(c => c.emit([cc.v2(0, 0)]));
    }

    /** 根据半径限制位置 */
    clampPos(pos: cc.Vec2) {
        let len = pos.mag();
        if (len > this.maxR) {
            let k = this.maxR / len;
            pos.x *= k;
            pos.y *= k;
        }
    }

    /** 根据位置转化角度 */
    covertToAngle(pos: cc.Vec2) {
        let r = Math.atan2(pos.y, pos.x);
        let d = cc.misc.radiansToDegrees(r);
        return d;
    }
}
