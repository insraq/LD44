export class CardType {
    public readonly color: Color;
    public readonly pattern: Pattern;
    constructor(color: Color, pattern: Pattern) {
        this.color = color;
        this.pattern = pattern;
    }
    public hash() {
        return this.color + ":" + this.pattern;
    }
}

export enum Color {
    Red = "#ff7675",
    Blue = "#0984e3",
    Black = "#2d3436",
    Green = "#00b894",
}

export enum Pattern {
    Gold = "Gold",
    Wood = "Wood",
    Water = "Water",
    Fire = "Fire",
    Earth = "Earth",
}
