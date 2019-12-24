
const { ccclass, property } = cc._decorator;

@ccclass
export default class Land extends cc.Component {

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.tag === 100) {
            // 碰到弓箭，速度归零
            otherCollider.node.getComponent(cc.RigidBody).linearVelocity = cc.Vec2.ZERO;
        }
    }
}
