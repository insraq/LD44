const { ccclass, property } = cc._decorator;

@ccclass
export default class Overlay extends cc.Component {

    @property(cc.Label)
    private text: cc.Label = null;

    public closeOverlay() {
        this.node.active = false;
    }

    public openOverlay(text: string) {
        this.text.string = text;
        this.node.active = true;
    }

}
