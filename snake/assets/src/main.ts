// author: 

const CELL_TIME = 0.016;
// 速度
const SNAKE_SPEED = 150;
// 蛇身大小
const SNAKE_CELL_SIZE = 30;
// 蛇身数量
const SNAKE_BODY_COUNT = 50;

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Node)
    node_snake_head: cc.Node = null; //蛇头

    @property(cc.Prefab)
    prefab_snake_body: cc.Prefab = null; //蛇身预制体

    // 蛇身节点
    private _node_snake_body: cc.Node[] = [];
    // 蛇移动方向
    private _snake_vector = cc.v2();
    // 蛇位置记录
    private _snake_pos: cc.Vec2[] = [];

    private _now_time: number = 0;

    onLoad() {
        // 添加蛇身
        for (let index = 0; index < SNAKE_BODY_COUNT; index++) {
            const body = cc.instantiate(this.prefab_snake_body);
            this.node_snake_head.parent.addChild(body, SNAKE_BODY_COUNT - index);
            this._node_snake_body.push(body);
        }
        this.node_snake_head.zIndex = SNAKE_BODY_COUNT + 1;

        // 蛇总长度
        const snake_length = SNAKE_CELL_SIZE * this._node_snake_body.length;
        // 每次移动的距离
        const snake_move_delta = SNAKE_SPEED * CELL_TIME;
        // 总共点数
        const snake_pos_count = Math.ceil(snake_length / snake_move_delta) + 1;
        this._snake_pos = [];
        // 初始化位置信息，按照蛇头的位置往下排
        for (let index = 0; index < snake_pos_count; index++) {
            this._snake_pos.push(cc.v2(this.node_snake_head.x, this.node_snake_head.y - index * snake_move_delta));
        }
        this.updateSnakeBodyPos();
        this._snake_pos.pop();
    }

    /** 摇杆触发回调 */
    private snakeMoving(vector: cc.Vec2, angle: number) {
        this._snake_vector = vector.normalize();
        if (angle) {
            this.node_snake_head.angle = angle - 90;
        }
    }

    // 更新蛇身体的位置
    private updateSnakeBodyPos() {
        const snake_move_delta = SNAKE_SPEED * CELL_TIME;
        this._node_snake_body.forEach((s, i) => {
            // 计算当前身体在位置中的索引
            const pos_index = Math.floor((i + 1) * SNAKE_CELL_SIZE / snake_move_delta);
            const pos = this._snake_pos[pos_index];
            if (pos) {
                s.x = pos.x;
                s.y = pos.y;
            } else {
                cc.log(`!pos`, i, pos_index, this._snake_pos.length)
            }
        })
    }

    private fix_update(dt: number) {
        if (this._snake_vector.magSqr() > 0) {
            this.node_snake_head.x += this._snake_vector.x * SNAKE_SPEED * dt;
            this.node_snake_head.y += this._snake_vector.y * SNAKE_SPEED * dt;
            this._snake_pos.unshift(cc.v2(this.node_snake_head.x, this.node_snake_head.y));
            this.updateSnakeBodyPos();
            this._snake_pos.pop();
        }
    }

    update(dt: number) {
        this._now_time += dt;
        while (this._now_time >= CELL_TIME) {
            this.fix_update(CELL_TIME);
            this._now_time -= CELL_TIME;
        }
    }
}

// 欢迎关注微信公众号[白玉无冰]