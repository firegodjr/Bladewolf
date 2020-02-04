import { BotFunction, BotFunctionMeta, BotFunctionResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Quote } from "../util/util";

let say: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {

    var thingToSay = "";
    for(var i = 0; i < args.length; ++i)
    {
        thingToSay += args[i] + " ";
    }

    Quote(message.channel, thingToSay);
    return {success: true}
}

let botFunction: BotFunctionMeta = {
    id: "say",
    keys: ["say", "echo", "repeat"],
    description: "Simply repeats what you type after the command",
    usage: "!say <text>",
    behavior: say
}

export = botFunction