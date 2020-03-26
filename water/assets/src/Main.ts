// author: http://lamyoung.com/


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Camera)
    camera_water: cc.Camera = null;

    @property(cc.Sprite)
    sp_water_show: cc.Sprite = null;

    @property(cc.Node)
    node_water_layer: cc.Node = null

    @property(cc.Node)
    node_generate: cc.Node = null

    @property(cc.Prefab)
    prefab_water: cc.Node = null;


    private _water_pool: cc.Node[] = [];

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1;
        const texture = new cc.RenderTexture();
        texture.initWithSize(this.sp_water_show.node.width, this.sp_water_show.node.height);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.camera_water.targetTexture = texture;
        this.sp_water_show.spriteFrame = spriteFrame;
    }

    private _waterGenrateCount = 0;
    private generateWater() {
        this.resetWater();
        for (let index = 0; index < 100; index++) {
            let node_water = this._water_pool.shift();
            if (!node_water) {
                node_water = cc.instantiate(this.prefab_water);
                this.node_water_layer.addChild(node_water);
            }
            node_water.active = false;
            node_water.scale = 0.5;
            node_water.x = Math.random() * 10 - 5 + this.node_generate.x;
            node_water.y = this.node_generate.y;
            node_water.getComponent(cc.RigidBody).linearVelocity = cc.v2();
        }
        this._waterGenrateCount = 0;
        this.schedule(this.scheduleWater, 0.05, this.node_water_layer.childrenCount - 1);
    }

    private scheduleWater() {
        this.node_water_layer.children[this._waterGenrateCount++].active = true;
    }

    private resetWater() {
        this.unschedule(this.scheduleWater);
        this.node_water_layer.children.forEach((v) => {
            v.active = false;
            this._water_pool.push(v)
        })
    }
}

// 欢迎关注微信公众号[白玉无冰]