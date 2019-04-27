import Card from "./Card";
import { CardEntity, Color, Pattern } from "./CardData";

const { ccclass, property } = cc._decorator;

const PADDING = 60;
const NODE_WIDTH = 150;
const ANIMATION_TIME = 0.25;
const MAX_HOLDING = 6;

let _instance: CardDeck = null;

@ccclass
export default class CardDeck extends cc.Component {

    public static getInstance(): CardDeck {
        if (_instance === null) {
            throw new Error("Placeholders is null, likely due to onLoad execution order");
        }
        return _instance;
    }

    public readonly holding: CardEntity[] = [];
    public readonly squad: CardEntity[] = [];

    private _unlockedSquad: number = 0;
    public get unlockedSquad() {
        return this._unlockedSquad;
    }
    public set unlockedSquad(value) {
        this.placeholders.children.forEach((node, i) => {
            node.children[0].active = i >= value;
        });
        this._unlockedSquad = value;
    }

    @property(cc.Prefab)
    private cardPrefab: cc.Prefab = null;
    @property(cc.Node)
    private placeholders: cc.Node = null;
    @property(cc.Node)
    private holdingNode: cc.Node = null;
    @property(cc.Node)
    private squadNode: cc.Node = null;

    public moveToSquad(c: Card): boolean {
        const index = this.holding.indexOf(c.card);
        if (index === -1 || this.squad.length >= this._unlockedSquad) {
            return false;
        }
        const cards = this.holding.splice(index, 1);
        this.squad.push(cards[0]);

        c.node.parent = this.squadNode;
        c.node.position = this.squadNode.convertToNodeSpaceAR(this.holdingNode.convertToWorldSpaceAR(c.node.position));
        c.node.runAction(cc.moveTo(ANIMATION_TIME, this.placeholders.children[this.squad.length - 1].position));

        this.rearrangeHolding();
        return true;
    }

    public moveToHolding(c: Card): boolean {
        const index = this.squad.indexOf(c.card);
        if (index === -1 || this.holding.length >= MAX_HOLDING) {
            return false;
        }

        const cards = this.squad.splice(index, 1);
        this.holding.push(cards[0]);

        c.node.parent = this.holdingNode;
        c.node.position = this.holdingNode.convertToNodeSpaceAR(this.squadNode.convertToWorldSpaceAR(c.node.position));
        this.rearrangeHolding();
        return true;
    }

    protected onLoad() {
        _instance = this;
    }

    protected start() {
        this.holding.push(new CardEntity(Color.Red, Pattern.Tree3));
        this.holding.push(new CardEntity(Color.Black, Pattern.Tree2));
        this.holding.push(new CardEntity(Color.Blue, Pattern.Tree1));
        this.holding.push(new CardEntity(Color.Red, Pattern.Tree2));
        this.holding.push(new CardEntity(Color.Green, Pattern.Tree3));
        this.holding.push(new CardEntity(Color.Purple, Pattern.Tree1));

        this.unlockedSquad = 2;

        this.holding.forEach((card) => {
            const node = cc.instantiate(this.cardPrefab);
            const c = node.getComponent(Card);
            c.build(card);
            node.parent = this.holdingNode;
        });

        this.rearrangeHolding();
    }

    private rearrangeHolding() {
        this.holdingNode.children.forEach((card, i) => {
            card.runAction(cc.moveTo(ANIMATION_TIME, this.getCardX(i), 0));
        });
    }

    private getCardX(index: number) {
        const w = cc.winSize.width - PADDING;
        const dist = (w - this.holding.length * NODE_WIDTH) / (this.holding.length - 1);
        return PADDING / 2 + (dist + NODE_WIDTH) * index + NODE_WIDTH / 2;
    }

}
