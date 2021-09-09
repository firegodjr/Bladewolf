import { BotFunctionMeta, BotFunction, BotFunctionResult } from "../botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Speak, FindArgument } from "../../util/util";

enum Advantage {
    ADV,
    NONE,
    DIS
}

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
    let advantage = Advantage.NONE;
    if(args.length < 1) return {success: false, failReason: "Not enough arguments"}
    if(args.length > 3) return {success: false, failReason: "Too many arguments"}

    // Set advantage/disadvantage
    let advIndex = FindArgument(["a", "adv", "advantage"], args);
    if(advIndex != -1) {
        advantage = Advantage.ADV;
        console.log("Removing adv");
        args.splice(advIndex);
    }
    advIndex = FindArgument(["d", "dis", "disadv", "disadvantage"], args);
    if(advIndex != -1) {
        advantage = Advantage.DIS;
        console.log("Removing dis");
        args.splice(advIndex);
    }

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
    let rolls: number[] = [];
    let advRolls: number[] = [];
    let finalRolls: number[] = [];
    let total: number = 0;
    for(let i = 0; i < amount; ++i) {
        let roll = Math.floor(Math.random() * type) + 1;
        let advRoll = Math.floor(Math.random() * type) + 1;
        rolls.push(roll);
        advRolls.push(advRoll);
    }
    
    for(let i = 0; i < rolls.length; ++i) {
        if(advantage == Advantage.ADV) {
            finalRolls[i] = Math.max(rolls[i], advRolls[i]);
        }
        else if(advantage == Advantage.DIS) {
            finalRolls[i] = Math.min(rolls[i], advRolls[i]);
        }
        else {
            finalRolls[i] = rolls[i];
        }
        total += finalRolls[i];
    }
    
    let thingToSay = `Rolled ${amount} d${type}${amount > 1 ? 's' : ''}.`;
    let possibleRolls = `\nRoll${amount > 1 ? 's' : ''}: ${rolls}`;
    if(possibleRolls.length < 1000) {
        thingToSay += `\nRoll${amount > 1 ? 's' : ''}: ${rolls.join(", ")}`;
        if(advantage != Advantage.NONE) {
            thingToSay += `\nAdv:   ${advRolls.join(", ")}`;
            thingToSay += `\nFinal Roll${amount > 1 ? 's' : ''}: ${finalRolls.join(", ")}`;
        }
        
    }
    else {
        thingToSay += "\nRolls: (Too many rolls to list)";
    }

    if(amount > 1) {
        thingToSay += `\nTotal: ${total}`;
    }

    Speak(channel, thingToSay);

    return {success: true}
}
