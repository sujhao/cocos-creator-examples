// author: http://lamyoung.com/


const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property([cc.RenderComponent])
    render_all: cc.RenderComponent[] = [];

    @property(cc.Material)
    material_normal: cc.Material = null;

    @property(cc.Material)
    material_attacked: cc.Material = null;

    onLoad() {
        this.render_all.forEach((render) => {
            render.setMaterial(0, this.material_normal);
            render.node.on(cc.Node.EventType.TOUCH_START, () => {
                this.attackOne(render);
            }, this)
        })
    }

    private attackOne(render: cc.RenderComponent) {
        render.setMaterial(0, this.material_attacked);
        this.scheduleOnce(() => {
            render.setMaterial(0, this.material_normal);
        }, 0.1)
    }

}

// 欢迎关注微信公众号[白玉无冰]