import KTVLabel from "./KTVLabel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(KTVLabel)
    ktvLabel: KTVLabel = null;

    private _lrc = ['欢迎关注白玉无冰', '每天进步一点点', '白首穷经,玉汝于成', '无所不能,冰冻三尺']

    private _speed = 0.1;
    private _index = 0;
    private _cur_lb_pos = 0;

    onLoad() {
        this.ktvLabel.string = this._lrc[this._index];
    }

    update(dt) {
        let cur = this._lrc[this._index];
        this._cur_lb_pos = this._cur_lb_pos + this._speed;
        let cur_length = cur.length;
        this.ktvLabel.progress = (this._cur_lb_pos / cur_length);
        if (this._cur_lb_pos >= cur_length) {
            this._index = ((this._index + 1) % this._lrc.length);
            this._cur_lb_pos = 0;
            this.ktvLabel.string = this._lrc[this._index];
            this.ktvLabel.progress = 0;
        }
    }
}
