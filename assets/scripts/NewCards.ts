import Card from "./Card";
import { CardType, Color, Pattern } from "./CardData";
import CardDeck from "./CardDeck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewCards extends cc.Component {

    @property(cc.Node)
    private panel: cc.Node = null;

    @property(cc.Node)
    private placeholders: cc.Node = null;

    @property(cc.Node)
    private cards: cc.Node = null;

    @property(cc.Prefab)
    private cardPrefab: cc.Prefab = null;

    public closePanel() {
        CardDeck.getInstance().newCardPanelOpen = false;
        this.panel.active = false;
        CardDeck.getInstance().mergeCards();
    }

    public openPanel({ freeReroll = false }) {
        if (freeReroll) {
            this.reroll({ free: freeReroll });
        }
        CardDeck.getInstance().newCardPanelOpen = true;
        this.panel.active = true;
    }

    protected start() {
        this.openPanel({ freeReroll: true });
    }

    private reroll({ free = false }) {
        this.cards.removeAllChildren();
        if (!free) {
            if (CardDeck.getInstance().life <= 2) {
                alert("You don't have enough lives");
                return;
            }
            CardDeck.getInstance().life -= 2;
        }
        this.placeholders.children.forEach((p) => {
            const node = cc.instantiate(this.cardPrefab);
            const c = node.getComponent(Card);
            c.build(new CardType(Color[Object.keys(Color).randOne()], Pattern[Object.keys(Pattern).randOne()]));
            node.parent = this.cards;
            node.position = p.position;
            c.isNewCard = true;
        });
    }
}
