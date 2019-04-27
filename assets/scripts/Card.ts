import { CardEntity } from "./CardData";
import CardDeck from "./CardDeck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Card extends cc.Component {
    public get level(): number {
        return this._level;
    }

    public set level(value: number) {
        this._level = value;
        this.level1.active = this._level >= 1;
        this.level2.active = this._level >= 2;
        this.level3.active = this._level >= 3;
    }

    public card: CardEntity = null;

    @property(cc.Node)
    private level1: cc.Node = null;
    @property(cc.Node)
    private level2: cc.Node = null;
    @property(cc.Node)
    private level3: cc.Node = null;
    @property(cc.Sprite)
    private pattern: cc.Sprite = null;
    @property(cc.Node)
    private tileFrame: cc.Node = null;
    private previousPosition: cc.Vec2 = null;

    private _level: number;

    public build(card: CardEntity) {
        this.card = card;
        const color = cc.color().fromHEX(this.card.color);
        // Pattern
        const url = `characters/${card.pattern.replace(" ", "-")}`;
        cc.loader.loadRes(url, cc.SpriteFrame, (err, spriteFrame) => {
            this.pattern.spriteFrame = spriteFrame;
            this.pattern.node.color = color;
        });
        // Level
        this.level = 1;

        this.level3.color = color;
        this.level2.color = color;
        this.level1.color = color;
        this.tileFrame.color = color;
    }

    protected start() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.previousPosition = this.node.position;
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.node.position = this.node.parent.convertToNodeSpaceAR(event.getLocation());
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.node.position.y > this.previousPosition.y) {
                if (!CardDeck.getInstance().moveToSquad(this)) {
                    this.node.position = this.previousPosition;
                }
            } else {
                if (!CardDeck.getInstance().moveToHolding(this)) {
                    this.node.position = this.previousPosition;
                }
            }
        });
    }

}
