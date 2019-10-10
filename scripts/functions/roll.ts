import { BotFunction, BotFunctionBehavior, BehaviorResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Speak } from "../util";

let rollBehavior: BotFunctionBehavior = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult => {
    if(args.length < 2) return {success: false, failReason: "Not enough arguments"}
    if(args.length > 2) return {success: false, failReason: "Too many arguments"}

    // Get amount of dice to roll
    let amount = parseInt(args[0]);
    if(isNaN(amount)) return {success: false, failReason: "First argument must be a number"}

    // Find amount of sides on the die
    let type: number = parseInt(args[1].slice(1));
    if(isNaN(type)) return {success: false, failReason: "Unable to figure out how many sides a " + args[1] + " has. Is it a valid type of die? (ex. d20)"}
    
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

let rollFunction: BotFunction = {
    keys: ["roll"],
    description: "Rolls some dice",
    usage: "!roll <# of dice> <type of dice (Ex. d10)>",
    behavior: rollBehavior
}

export = rollFunction