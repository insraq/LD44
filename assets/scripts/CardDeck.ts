import Card from "./Card";
import { CardEntity, Color, Pattern } from "./CardData";

const { ccclass, property } = cc._decorator;

declare const vConsole: any;

@ccclass
export default class CardDeck extends cc.Component {

    @property(cc.Prefab)
    private cardPrefab: cc.Prefab = null;

    protected onLoad() {
        const cards = [
            new CardEntity(Color.Red, Pattern.Tree3),
            new CardEntity(Color.Purple, Pattern.Tree2),
            new CardEntity(Color.Blue, Pattern.Tree1),
            new CardEntity(Color.Green, Pattern.Tree1),
            new CardEntity(Color.Green, Pattern.Tree2),
            new CardEntity(Color.Green, Pattern.Tree3),
        ];
        renderCards(cards, this.cardPrefab, this.node);
    }

}

export function renderCards(cards: CardEntity[], cardPrefab: cc.Prefab, renderTarget: cc.Node) {
    const padding = 60;
    const w = cc.winSize.width - padding;
    cards.forEach((card, i) => {
        const node = cc.instantiate(cardPrefab);
        const dist = (w - cards.length * node.width) / (cards.length - 1);
        const c = node.getComponent(Card);
        c.build(card);
        node.parent = renderTarget;
        node.x = padding / 2 + (dist + node.width) * i + node.width / 2;
        return node;
    });
}
