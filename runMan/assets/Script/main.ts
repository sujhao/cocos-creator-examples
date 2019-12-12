import charaterItem from "./charaterItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(cc.Prefab)
    charaterPrefab: cc.Prefab = null;

    onEnable() {
        for (let index = 0; index < 6; index++) {
            const node = cc.instantiate(this.charaterPrefab);
            node.getComponent(charaterItem).init(this.node, -this.node.width * 0.6, this.node.width * 0.6, -this.node.height * 0.1, this.node.height * 0.1);
        }
    }

}
