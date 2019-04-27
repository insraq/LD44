export class CardEntity {
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
    Black = "#2d3436",
}

export enum Pattern {
    Tree1 = "Tree1",
    Tree2 = "Tree2",
    Tree3 = "Tree3",
    Dot = "Dot",
    A = "A",
    Square = "Square",
    Triangle = "Triangle",
    People = "People",
}
