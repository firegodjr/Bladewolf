import { BotFunction, BotFunctionBehavior, BehaviorResult } from "./botfunction";
import { Message, Channel, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { Speak } from "../util";

let setRoleColor: BotFunctionBehavior = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult => {
    var role = message.guild.roles.get(message.member.colorRole.id);
    if(role != undefined && role.editable)
    {
        var hexColor = args[0];
        var validHex = hexColor.match("[g-zG-Z]") == null;
        if(!hexColor.startsWith("#"))
        {
            Speak(channel, "Please enter a hex number. ex: #0f0ac3");
            return {success: false}
        }
        else if(hexColor.endsWith("000000"))
        {
            return {success: false, failReason: "Unable to apply solid black names"}
        }
        else if(!validHex)
        {
            return {success: false, failReason: "Invalid hexadecimal"}
        }
        else if(role != undefined)
        {
            role.edit({color: hexColor}).catch(e => {
                return Speak(message.channel, "Error: unable to edit user's role.");
                });
            Speak(channel, "Set the role '" + role.name + "' color to " + args[0]);
        }
    }
    else
    {
        return {success: false, failReason: "Either this user doesn't have a name-coloring role, or I don't have permission to edit their role."}
    }
    
    return {success: true}
}

let botFunction: BotFunction = {
    keys: ["rolecolor", "color", "colorme"],
    description: "Changes the color of your name-coloring role",
    usage: "!rolecolor <hex color, ex. #4bec13>",
    behavior: setRoleColor
}

export = botFunction