const { ccclass, property } = cc._decorator;

@ccclass
export default class Helloworld extends cc.Component {
    @property(cc.Camera)
    camera: cc.Camera = null;

    @property([cc.Sprite])
    sp_cameras: cc.Sprite[] = [];

    @property(cc.Node)
    node_icon: cc.Node = null;

    onLoad() {
        const texture = new cc.RenderTexture();
        texture.initWithSize(this.sp_cameras[0].node.width, this.sp_cameras[0].node.height);
        const spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.camera.targetTexture = texture;
        this.sp_cameras.forEach((v) => {
            v.spriteFrame = spriteFrame
        })
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onNodeIconTouchMove, this);
        this.schedule(this.shadowFollow, 0.1, cc.macro.REPEAT_FOREVER);
    }

    private shadowFollow() {
        this.sp_cameras.forEach((v, i) => {
            const dis = this.node.position.sub(v.node.position).mag(); 
            if (dis > 0) {
                v.node.stopAllActions();
                v.node.runAction(cc.moveTo(i * 0.05 + 0.02, this.node_icon.x, this.node_icon.y));
            }
        })
    }

    private onNodeIconTouchMove(evt: cc.Event.EventTouch) {
        this.node_icon.x += evt.getDeltaX();
        this.node_icon.y += evt.getDeltaY();
    }
}
