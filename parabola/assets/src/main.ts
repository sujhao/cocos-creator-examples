// author : lamyoung
const { ccclass, property } = cc._decorator;

// 重力
const G = -640;
// 固定速度
const V = 1000;
// 开始位置
const START_POS = cc.v2(-400, 20);

@ccclass
export default class Main extends cc.Component {

    @property({ type: cc.Graphics, tooltip: '瞄准线作图' })
    graphic_line: cc.Graphics = null;

    @property({ type: cc.RigidBody, tooltip: '弓箭' })
    rigidBody_arrow: cc.RigidBody = null;

    @property({ type: cc.Toggle, tooltip: '是否高抛' })
    toggle_arrow: cc.Toggle = null;

    // 平抛线性初速度
    private _linearVelocity_1: cc.Vec2 = cc.v2(0, 0);
    // 高抛线性初速度
    private _linearVelocity_2: cc.Vec2 = cc.v2(0, 0);
    // 所有箭
    private _all_arrows: cc.RigidBody[] = [];

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, G);
        // cc.director.getPhysicsManager().debugDrawFlags = 1;
        this.graphic_line.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.graphic_line.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchStart, this);

        this._all_arrows.push(this.rigidBody_arrow);
        for (let index = 0; index < 10; index++) {
            const element = cc.instantiate(this.rigidBody_arrow.node);
            this.rigidBody_arrow.node.parent.addChild(element);
            this._all_arrows.push(element.getComponent(cc.RigidBody));
        }

        this.schedule(this.fireArrow, 0.5, cc.macro.REPEAT_FOREVER);
    }

    private onTouchStart(touch: cc.Event.EventTouch) {
        const location = this.rigidBody_arrow.node.parent.convertToNodeSpaceAR(touch.getLocation());

        const s = location.x - START_POS.x;
        const h = location.y - START_POS.y;

        // a*t^2 + b*t + c = 0
        const a = G * this.rigidBody_arrow.gravityScale * s / (2 * V * V);
        const b = 1;
        const c = a - h / s;
        const delta = b * b - 4 * a * c;
        if (delta >= 0) {
            // 一元二次方程求根公式
            const t1 = (-b + Math.sqrt(delta)) / (2 * a); // 平抛 tan 值
            const t2 = (-b - Math.sqrt(delta)) / (2 * a); // 高抛 tan 值

            // 二、三象限角度要加 180
            const alpha1 = Math.atan(t1) + (s < 0 ? Math.PI : 0);
            const alpha2 = Math.atan(t2) + (s < 0 ? Math.PI : 0);

            const v_x_1 = Math.cos(alpha1) * V;
            const v_y_1 = Math.sin(alpha1) * V;
            const v_x_2 = Math.cos(alpha2) * V;
            const v_y_2 = Math.sin(alpha2) * V;

            this._linearVelocity_1.x = v_x_1;
            this._linearVelocity_1.y = v_y_1;

            this._linearVelocity_2.x = v_x_2;
            this._linearVelocity_2.y = v_y_2;
        } else {
            this._linearVelocity_1 = cc.Vec2.ZERO;
            this._linearVelocity_2 = cc.Vec2.ZERO;
        }

        this.drawArrowTrace();
    }

    // 画轨迹
    private drawArrowTrace() {
        this.graphic_line.clear();
        const linearVelocity = this.getArrowFirelinearVelocity();

        if (linearVelocity.x) {
            const dt = 0.05;
            for (let count = 0; count < 100; count++) {
                const time = dt * count;
                // s = v_x * t
                const dx = linearVelocity.x * time;
                // h = v_y * t + 0.5 * a * t * t
                const dy = linearVelocity.y * time + 0.5 * G * this.rigidBody_arrow.gravityScale * time * time;
                // 当前时间点坐标
                const targetX = START_POS.x + dx;
                const targetY = START_POS.y + dy;
                // 坐标超过地板就不画了
                if (targetY < -300) break;
                this.graphic_line.circle(targetX, targetY, 8);
            }
        }
        this.graphic_line.fill();
    }

    // 获取发射速度
    private getArrowFirelinearVelocity() {
        return this.toggle_arrow.isChecked ? this._linearVelocity_2.clone() : this._linearVelocity_1.clone();
    }

    private _index = 0;
    private fireArrow() {
        const linearVelocity = this.getArrowFirelinearVelocity();
        if (linearVelocity.x) {
            const rigidBody_arrow = this._all_arrows[this._index++ % this._all_arrows.length];
            rigidBody_arrow.node.setPosition(START_POS);
            rigidBody_arrow.node.getComponentInChildren(cc.MotionStreak).reset();
            rigidBody_arrow.linearVelocity = linearVelocity;
        }
    }

    update() {
        for (const rigidBody of this._all_arrows) {
            if (rigidBody.linearVelocity.x) {
                // 计算夹角
                const angle = rigidBody.linearVelocity.clone().signAngle(cc.v2(1, 0));
                rigidBody.node.angle = -angle * 180 / Math.PI;
            }
        }
    }

}

// 欢迎关注【白玉无冰】公众号