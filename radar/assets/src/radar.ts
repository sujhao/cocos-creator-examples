// author: http://lamyoung.com/

const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class Radar extends cc.Component {

    @property(cc.Graphics)
    graphics: cc.Graphics = null;

    @property
    private _side_max_length: number = 100;
    public get side_max_length() {
        return this._side_max_length;
    }
    @property({ type: cc.Integer, min: 1, tooltip: '雷达图的边最大长度', serializable: true })
    public set side_max_length(value) {
        this._side_count = value;
        this.drawRadar();
    }

    @property
    private _stroke: boolean = true;
    public get stroke() {
        return this._stroke;
    }
    @property({ type: cc.Boolean, tooltip: '描边', serializable: true })
    public set stroke(value) {
        this._stroke = value;
        this.drawRadar();
    }

    @property
    private _fill: boolean = true;
    public get fill() {
        return this._fill;
    }
    @property({ type: cc.Boolean, tooltip: '填充', serializable: true })
    public set fill(value) {
        this._fill = value;
        this.drawRadar();
    }

    @property
    private _side_count: number = 6;
    public get side_count() {
        return this._side_count;
    }
    @property({ type: cc.Integer, min: 3, step: 1, tooltip: '雷达图的边的数量', serializable: true })
    public set side_count(value) {
        this._side_count = value;
        this.drawRadar();
    }

    @property
    private _side_percent: number[] = [100, 100, 100, 100, 100, 100];
    public get side_percent() {
        return this._side_percent;
    }
    @property({ type: [cc.Integer], min: 0, step: 1, tooltip: '每个边的百分比', serializable: true })
    public set side_percent(value) {
        this._side_percent = value;
        this.drawRadar();
    }

    onLoad() {
        if (!this.graphics) {
            this.graphics = this.addComponent(cc.Graphics);
        }
        this.drawRadar();
    }

    drawRadar() {
        this.graphics.clear();
        // 每个夹角
        const radians_per = Math.PI * 2 / this.side_count;
        for (let side_i = 0; side_i < this.side_count; side_i++) {
            const percent = (this.side_percent[side_i] || 0) / 100;
            // 每个边的长度
            const side_length = this.side_max_length * percent;
            // 初始边放在y轴，多90度
            const radians = side_i * radians_per + Math.PI / 2;
            // 坐标计算 x = r * cos   y = r * sin
            const posX = side_length * Math.cos(radians);
            const posY = side_length * Math.sin(radians);
            if (side_i === 0) {
                this.graphics.moveTo(posX, posY);
            } else {
                this.graphics.lineTo(posX, posY);
            }
        }
        this.graphics.close();
        if (this.stroke)
            this.graphics.stroke();
        if (this.fill)
            this.graphics.fill();
    }
}


// 欢迎关注公众号【白玉无冰】