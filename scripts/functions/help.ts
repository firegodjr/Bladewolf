import { BotFunctionBehavior, BotFunction, BehaviorResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Speak } from "../util";
import { State } from "../state/botstate";
import { PermLevel } from "../state/opmgr";

let help: BotFunctionBehavior = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult => {
    let thingToSay = "";
    let botFunctions = State.GetRegisteredFunctions();

    if(args.length == 0) {
        thingToSay += "All Bot Functions (Say !help <function> for specific help)\n"
        botFunctions.forEach((bf) => {
            if(!bf.hidden) {
                thingToSay += "> !" + bf.keys[0];
                if(bf.description) {
                    thingToSay += " - " + bf.description;
                }
                thingToSay += "\n";
            }
        });
    }
    else {
        let bf = State.GetFunctionByKey(args[0])
        if(bf && !bf.hidden) {
            thingToSay += "Function: " + bf.keys[0] + "\n";
            thingToSay += "Aliases: " + bf.keys.join(", ") + "\n";
            if(bf.usage)
                thingToSay += "Usage: " + bf.usage + "\n";
            if(bf.description)
                thingToSay += "Description: " + bf.description + "\n";
            thingToSay += "Minimum permission level: " + PermLevel[bf.permLevel || PermLevel.USER] + "\n";
        }
        else {
            thingToSay = "There is no command with alias '" + args[0] + "'";
        }
    }

    Speak(message.channel, thingToSay);

    return {success: true}
}

let botFunction: BotFunction = {
    keys: ["help"],
    description: "Explains the bot functions in detail",
    usage: "!help, !help <function>",
    behavior: help
}

export = botFunction