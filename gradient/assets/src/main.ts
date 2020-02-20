// lamyoung.com
const { ccclass, property } = cc._decorator; 

@ccclass
export default class NewClass extends cc.Component {

    @property({ type: [cc.Sprite] })
    sps: cc.Sprite[] = [];

    _gradient_value: number = 0;
    update(dt) {
        this.sps.forEach((sp) => {
            let material = sp['sharedMaterials'][0];
            if (material) {
                this._gradient_value = (this._gradient_value + 0.003) % 1;
                material.setProperty('gradient_value', this._gradient_value);
            }
        })
    }
}

// 欢迎关注微信公众号【白玉无冰】