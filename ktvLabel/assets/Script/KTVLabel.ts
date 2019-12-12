
const lb_uuid = '__baiyuwubing-lamyoung_lb';
const lb_top_uuid = '__baiyuwubing-lamyoung_lb_top_uuid';
const lb_mask_uuid = '__baiyuwubing-lamyoung_lb_mask_uuid';

const { ccclass, property } = cc._decorator;

@ccclass
export default class KTVLabel extends cc.Component {

    private _string: string = '白玉无冰'
    @property({ multiline: false })
    set string(v) {
        //cc.log(v);
        this._string = v;
        this._updateRenderData();
    }
    get string() {
        return this._string
    }

    private _color = cc.Color.WHITE;
    get color() {
        return this._color.clone();
    }
    @property({ tooltip: '底部颜色。默认为白色。' })
    set color(value) {
        if (!this._color.equals(value)) {
            this._color.set(value);
            this._updateRenderData();
        }
    }

    private _color_mask = cc.Color.RED
    @property({ tooltip: '上层字体颜色。默认红色。' })
    get color_mask() {
        return this._color_mask.clone();
    }
    set color_mask(value) {
        if (!this._color_mask.equals(value)) {
            this._color_mask.set(value);
            this._updateRenderData();
        }
    }

    private _progress = 0.6;
    @property({
        type: 'Float',
        range: [0, 1],
        step: 0.01,
        slide: true,
        tooltip: CC_DEV && 'i18n:COMPONENT.progress.progress',
    })
    get progress() {
        return this._progress;
    }
    set progress(value) {
        if (this._progress === value) return;

        this._progress = value;
        this._checkLabelInit();
        this._updateBarStatus();
    }

    private _fontSize = 40;
    @property({ tooltip: CC_DEV && 'i18n:COMPONENT.label.font_size' })
    get fontSize() {
        return this._fontSize;
    }
    set fontSize(value) {
        if (this._fontSize === value) return;
        this._fontSize = value;
        this._updateRenderData();
    }

    private _label: cc.Label;
    private _label_mask: cc.Label;
    private _node_mask: cc.Node;

    _checkLabelInit() {
        if (!this._label) {
            const node = this.node.getChildByName(lb_uuid) || new cc.Node();
            node.anchorX = 0;
            node.name = lb_uuid;
            this._label = node.getComponent(cc.Label) || node.addComponent(cc.Label);
            if (node.parent !== this.node)
                this.node.addChild(node);

        	node.off(cc.Node.EventType.SIZE_CHANGED, this._updateBarStatus, this);
        	node.on(cc.Node.EventType.SIZE_CHANGED, this._updateBarStatus, this);
        }

        if(!this._node_mask){
         	const node = this.node.getChildByName(lb_mask_uuid) || new cc.Node();
         	node.anchorX = 0;
            node.name = lb_mask_uuid;
           	const mask = node.getComponent(cc.Mask) || node.addComponent(cc.Mask);
            this._node_mask = node;
            if (node.parent !== this.node)
                this.node.addChild(node);
        }

        if (!this._label_mask) {
            const node = this._node_mask.getChildByName(lb_top_uuid) || new cc.Node();
            node.anchorX = 0;
            node.name = lb_top_uuid;
            this._label_mask = node.getComponent(cc.Label) || node.addComponent(cc.Label);
            if (node.parent !== this._node_mask)
                this._node_mask.addChild(node);
        }
    }

    _updateRenderData() {
        // cc.log('KtvLabel _updateRenderData');
        this._checkLabelInit();
        this._label_mask.lineHeight = this._label_mask.fontSize = this._label.lineHeight = this._label.fontSize = this.fontSize;
        this._label.node.color = this.color;
        this._label_mask.node.color = this.color_mask;
        this._label_mask.string = this._label.string = this._string;
        this._updateBarStatus();
    }


    _updateBarStatus() {
        //cc.log(`_updateBarStatus`, this._node_mask.node.width)
        this._node_mask.width = Math.round(this._label.node.width * this.progress);
        this._node_mask.height = this._label.node.height;
    }
}

// 欢迎关注【白玉无冰】公众号