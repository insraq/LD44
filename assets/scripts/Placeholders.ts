import Card from "./Card";
import { CardType, Color, Pattern } from "./CardData";
import CardDeck from "./CardDeck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Placeholders extends cc.Component {

    protected start() {
        const cd = CardDeck.getInstance();
        this.node.children.forEach((c, i) => {
            c.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
                if (i >= cd.unlockedSquad) {
                    const cost = Math.floor(cd.life / 10);
                    if (cd.life <= cost) {
                        alert("You don't have enough lives");
                        return;
                    }
                    if (confirm(`Unlock this slot with ${cost} lives?`)) {
                        cd.unlockedSquad++;
                        cd.life -= cost;
                    }
                }
            });
        });
    }
}
