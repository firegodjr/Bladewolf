import { rollDice } from "./roll";
import { Speak } from "../../util";
import { Channel } from "discord.js";

export enum Advantage {
    NORMAL,
    ADVANTAGE,
    DISADVANTAGE
}

export class Stat {
    name: string = ""
    shorthand: string = ""
    value: number = 0
    modifier: number = 0
    proficient: boolean = false
    children: string[] = []

    constructor(name: string, shorthand: string, value: number) {
        this.name = name;
        this.shorthand = shorthand;
        this.value = value;
        this.modifier = Math.floor((this.value - 10) / 2);
    }

    setValue(value: number) {
        this.value = value;
        this.modifier = Math.floor((this.value - 10) / 2);
    }
}