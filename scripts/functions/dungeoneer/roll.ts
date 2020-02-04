import { BotFunctionMeta, BotFunction, BotFunctionResult } from "../botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Speak } from "../../util/util";

interface DiceResult {
    amount: number,
    type: number
}

interface RollResult {
    rolls: number[],
    total: number
}

export function parseDice(dice: string): DiceResult {
    let values = dice.split("d");
    if(values.length != 2) {
        return {amount: 0, type: 0};
    }
    let amount = parseInt(values[0]);
    let type = parseInt(values[1]);

    return {amount: amount, type: type};
}

export function rollDice(amount: number, type: number): RollResult {
    let rolls: number[] = []
    let total: number = 0;
    for(let i = 0; i < amount; ++i) {
        let roll = Math.floor(Math.random() * type) + 1;
        rolls.push(roll);
        total += roll;
    }

    return {rolls: rolls, total: total}
}


export let rollBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    if(args.length < 1) return {success: false, failReason: "Not enough arguments"}
    if(args.length > 2) return {success: false, failReason: "Too many arguments"}

    let amount = 0
    let type: number = 0
    if(args.length == 2) {
        amount = parseInt(args[0]);
        type = parseInt(args[1].slice(1));
    }
    else {
        let values = args[0].split("d");
        amount = parseInt(values[0]);
        type = parseInt(values[1]);
    }
    if(isNaN(amount)) return {success: false, failReason: "First argument must be a number"}
    if(isNaN(type)) return {success: false, failReason: "Unable to figure out how many sides the die has. Is it a valid type of die? (ex. d20)"}
    
    // Do rolls
    let rolls: number[] = []
    let total: number = 0;
    for(let i = 0; i < amount; ++i) {
        let roll = Math.floor(Math.random() * type) + 1;
        rolls.push(roll);
        total += roll;
    }
    let thingToSay = `Rolled ${amount} d${type}s.`;
    let possibleRolls = `\nRolls: ${rolls}`;
    if(possibleRolls.length < 1000) {
        thingToSay += `\nRolls: ${rolls.join(", ")}`;
    }
    else {
        thingToSay += "\nRolls: (Too many rolls to list)";
    }
    thingToSay += `\nTotal: ${total}`;

    Speak(channel, thingToSay);

    return {success: true}
}
