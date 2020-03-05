import Radar from "./radar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Main extends cc.Component {

    @property(Radar)
    radar_top: Radar = null;

    onLoad() {
        this.schedule(() => {
            this.radar_top.side_percent.forEach((v, i) => {
                let new_percent = v + (Math.random() - 0.5) * 10;
                if (new_percent < 0) new_percent = 0;
                if (new_percent > 100) new_percent = 100;
                this.radar_top.side_percent[i] = new_percent;
            })
            this.radar_top.drawRadar();
        }, 0.3, cc.macro.REPEAT_FOREVER)
    }
}
