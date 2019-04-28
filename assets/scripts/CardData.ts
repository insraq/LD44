export class CardType {
    public readonly color: Color;
    public readonly pattern: Pattern;
    constructor(color: Color, pattern: Pattern) {
        this.color = color;
        this.pattern = pattern;
    }
}

export enum Color {
    Red = "#ff7675",
    Blue = "#0984e3",
    Purple = "#6c5ce7",
    Green = "#00b894",
}

export enum Pattern {
    Tree1 = "Tree1",
    Tree2 = "Tree2",
    Tree3 = "Tree3",
    Kou1 = "Kou1",
    Kou2 = "Kou2",
    Kou3 = "Kou3",
    Fire1 = "Fire1",
    Fire2 = "Fire2",
    Fire3 = "Fire3",
    Earth1 = "Earth1",
    Earth2 = "Earth2",
    Earth3 = "Earth3",
}
