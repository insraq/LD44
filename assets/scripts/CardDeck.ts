import Card from "./Card";
import { CardType, Color, Pattern } from "./CardData";
import NewCards from "./NewCards";
import Overlay from "./Overlay";

const { ccclass, property } = cc._decorator;

const PADDING = 60;
const NODE_WIDTH = 150;
export const ANIMATION_TIME = 0.25;
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

    public newCardPanelOpen: boolean = false;

    @property(cc.Node)
    public readonly dragToRemove: cc.Node = null;

    @property(cc.Node)
    private nextTurn: cc.Node = null;

    @property(NewCards)
    private newCards: NewCards = null;

    private _unlockedSquad: number = 0;
    public get unlockedSquad() {
        return this._unlockedSquad;
    }
    public set unlockedSquad(value) {
        this.setHoldingAreaLabel();
        this.placeholders.children.forEach((node, i) => {
            node.children[0].active = i >= value;
        });
        this._unlockedSquad = value;
    }

    private _life: number = 100;
    public get life(): number {
        return this._life;
    }
    public set life(value: number) {
        this.lifeLabel.string = `Life: ${value}`;
        this._life = value;
    }

    private _opponentLife: number = 100;
    public get opponentLife(): number {
        return this._opponentLife;
    }
    public set opponentLife(value: number) {
        this.opponentLifeLabel.string = `Opponent's Life: ${value}`;
        this._opponentLife = value;
    }

    @property(cc.Prefab)
    private cardPrefab: cc.Prefab = null;
    @property(cc.Node)
    private placeholders: cc.Node = null;
    @property(cc.Node)
    private holdingNode: cc.Node = null;
    @property(cc.Node)
    private squadNode: cc.Node = null;
    @property(cc.Node)
    private squadNodeClone: cc.Node = null;
    @property(cc.Node)
    private opponentSquadNode: cc.Node = null;
    @property(cc.Label)
    private holdingAreaLabel: cc.Label = null;
    @property(cc.Label)
    private lifeLabel: cc.Label = null;
    @property(cc.Label)
    private opponentLifeLabel: cc.Label = null;

    private turnCount: number = 0;

    public moveToSquad(c: Card): boolean {
        if (this.squadNode.childrenCount >= this._unlockedSquad) {
            return false;
        }
        c.node.position = this.squadNode.convertToNodeSpaceAR(c.node.parent.convertToWorldSpaceAR(c.node.position));
        c.node.parent = this.squadNode;
        this.rearrangeCards();
        return true;
    }

    public sell(c: Card): boolean {
        c.node.parent = this.node;
        c.node.destroy();
        this.life += Math.pow(3, c.level - 1);
        this.rearrangeCards();
        return true;
    }

    public toggleNextTurn(showNextTurn) {
        this.nextTurn.active = showNextTurn;
        this.dragToRemove.active = !showNextTurn;
    }

    public moveToHolding(c: Card): boolean {
        if (this.holdingNode.childrenCount >= MAX_HOLDING) {
            return false;
        }
        c.node.position = this.holdingNode.convertToNodeSpaceAR(c.node.parent.convertToWorldSpaceAR(c.node.position));
        c.node.parent = this.holdingNode;
        this.rearrangeCards();
        return true;
    }

    public addToHolding(c: Card): boolean {
        if (this.holdingNode.childrenCount >= MAX_HOLDING) {
            alert("Holding area is full");
            return false;
        }
        if (this.life <= 2) {
            alert("You don't have enough lives");
            return;
        }
        this.life -= 2;
        c.node.position = this.holdingNode.convertToNodeSpaceAR(c.node.parent.convertToWorldSpaceAR(c.node.position));
        c.node.parent = this.holdingNode;
        c.isNewCard = false;
        this.rearrangeCards();
        return true;
    }

    public doNextTurn() {

        if (this.squadNode.childrenCount < this.unlockedSquad) {
            alert("Your have empty battle card slots, drag more cards from holding area");
            return;
        }

        this.turnCount++;
        this.opponentLife -= cc.randf(Math.floor(this.opponentLife * 0.05), Math.floor(this.opponentLife * 0.15));
        const opponentSquad = [];
        for (let i = 0; i < Math.min(2 + this.turnCount, 8); i++) {
            opponentSquad.push(new CardType(
                Color[Object.keys(Color).randOne()],
                Pattern[Object.keys(Pattern).randOne()],
            ));
        }
        // Build opponent squad
        const opponentFreq: { [k: string]: Card[] } = {};
        this.opponentSquadNode.removeAllChildren();
        opponentSquad.forEach((card, i) => {
            const node = cc.instantiate(this.cardPrefab);
            const c = node.getComponent(Card);
            c.build(card);
            c.isOpponentCard = true;
            node.parent = this.opponentSquadNode;
            node.x = this.getCardX(opponentSquad.length, i);
            if (opponentFreq[c.card.color]) {
                opponentFreq[c.card.color].push(c);
            } else {
                opponentFreq[c.card.color] = [c];
            }
            if (opponentFreq[c.card.pattern]) {
                opponentFreq[c.card.pattern].push(c);
            } else {
                opponentFreq[c.card.pattern] = [c];
            }
        });
        // Clone my own squad
        const freq: { [k: string]: Card[] } = {};
        this.squadNodeClone.removeAllChildren();
        this.squadNode.children.forEach((cloneFrom) => {
            const node = cc.instantiate(this.cardPrefab);
            const c = node.getComponent(Card);
            const ccc = cloneFrom.getComponent(Card);
            c.build(ccc.card, ccc.level);
            node.parent = this.squadNodeClone;
            node.position = cloneFrom.position;
            if (freq[c.card.color]) {
                freq[c.card.color].push(c);
            } else {
                freq[c.card.color] = [c];
            }
            if (freq[c.card.pattern]) {
                freq[c.card.pattern].push(c);
            } else {
                freq[c.card.pattern] = [c];
            }
        });

        this.opponentSquadNode.parent.active = true;
        this.squadNode.active = false;

        const myCards = this.squadNodeClone.children.map((c) => c.getComponent(Card));
        const opponentCards = this.opponentSquadNode.children.map((c) => c.getComponent(Card));

        const callback = () => {
            if (myCards.length <= 0 || opponentCards.length <= 0) {
                this.unschedule(callback);
                const myScore = myCards.reduce((prev, current) => prev += current.level, 0);
                const opponentScore = opponentCards.reduce((prev, current) => prev += current.level, 0);
                const diff = 2 * (myScore - opponentScore);
                this.opponentSquadNode.parent.active = false;
                this.squadNodeClone.removeAllChildren();
                this.squadNode.active = true;
                if (diff > 0) {
                    alert(`You have killed opponent ${Math.abs(diff)} lives`);
                    this.opponentLife -= diff;
                } else if (diff < 0) {
                    alert(`You have lost ${Math.abs(diff)} lives`);
                    this.life += diff;
                } else {
                    alert("It's a tie!");
                }
                if (this.opponentLife <= 0) {
                    alert("You have won!");
                    cc.director.loadScene("Main");
                    return;
                }
                if (this.life <= 0) {
                    alert("You have lost!");
                    cc.director.loadScene("Main");
                    return;
                }
                this.scheduleOnce(() => {
                    this.newCards.openPanel({ freeReroll: true });
                }, 0.5);
                return;
            }
            const o = opponentCards[0];
            const m = myCards[0];
            m.node.runAction(cc.sequence(
                cc.moveTo(
                    0.25,
                    m.node.parent.convertToNodeSpaceAR(o.node.getWorldPosition()).sub(cc.v2(0, 50)),
                ).easing(cc.easeInOut(3)),
                cc.moveTo(
                    0.25,
                    m.node.position,
                ).easing(cc.easeInOut(3)),
                cc.callFunc(() => {
                    const d = Math.min(m.level, o.level);
                    m.level -= d;
                    o.level -= d;
                    if (m.level <= 0) {
                        myCards.shift();
                    }
                    if (o.level <= 0) {
                        opponentCards.shift();
                    }
                }),
            ));
        };
        Object.keys(freq).forEach((k) => {
            if (freq[k].length >= 3) {
                freq[k].forEach((c) => {
                    c.level++;
                    c.playUpgradeAnimation(0);
                });
            }
        });
        Object.keys(opponentFreq).forEach((k) => {
            if (opponentFreq[k].length >= 3) {
                opponentFreq[k].forEach((c) => {
                    c.level++;
                    c.playUpgradeAnimation(0);
                });
            }
        });
        this.schedule(callback, 1, cc.macro.REPEAT_FOREVER);
    }

    public mergeCards() {
        const freq: { [k: string]: Card[] } = {};
        this.squadNode.children.concat(this.holdingNode.children).forEach((n) => {
            const c = n.getComponent(Card);
            if (freq[c.card.color + c.card.pattern + c.level]) {
                freq[c.card.color + c.card.pattern + c.level].push(c);
            } else {
                freq[c.card.color + c.card.pattern + c.level] = [c];
            }
        });
        Object.keys(freq).forEach((k) => {
            if (freq[k].length === 3) {
                freq[k][0].level++;
                freq[k][0].playUpgradeAnimation();

                freq[k][1].node.parent = this.node;
                freq[k][1].node.destroy();

                freq[k][2].node.parent = this.node;
                freq[k][2].node.destroy();
            }
        });
        this.rearrangeCards();
    }

    public turnInProgress(): boolean {
        return this.opponentSquadNode.parent.active;
    }

    protected onLoad() {
        _instance = this;
    }

    protected start() {
        this.unlockedSquad = 3;
        this.life = 100;
        this.opponentLife = 100;
    }
    private setHoldingAreaLabel() {
        this.holdingAreaLabel.string = `Holding Area ${this.holdingNode.childrenCount}/${MAX_HOLDING}`;
    }

    private rearrangeCards() {
        this.rearrangeSquad();
        this.rearrangeHolding();
    }

    private rearrangeHolding() {
        this.setHoldingAreaLabel();
        this.holdingNode.children.forEach((card, i) => {
            card.stopAllActions();
            card.scale = 1;
            card.runAction(cc.moveTo(ANIMATION_TIME, this.getCardX(this.holdingNode.childrenCount, i), 0));
        });
    }

    private rearrangeSquad() {
        this.squadNode.children.forEach((card, i) => {
            card.stopAllActions();
            card.scale = 1;
            card.runAction(cc.moveTo(ANIMATION_TIME, this.placeholders.children[i].position));
        });
    }

    private getCardX(total: number, index: number) {
        const w = cc.winSize.width - PADDING;
        if (total === 1) {
            return NODE_WIDTH / 2 + PADDING / 2;
        }
        const dist = (w - total * NODE_WIDTH) / (total - 1);
        return PADDING / 2 + (dist + NODE_WIDTH) * index + NODE_WIDTH / 2;
    }

}
