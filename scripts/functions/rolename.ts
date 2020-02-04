import { BotFunction, BotFunctionResult, BotFunctionMeta } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { MergeArgsPast, Speak } from "../util/util";

let rolenameBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    var role = message.guild.roles.get(message.member.colorRole.id);
    if(role != undefined && role.editable)
    {
        var roleName = MergeArgsPast(args, 1);
        role.edit({name: roleName});
        Speak(channel, "Your role is now '" + roleName + "'");
        return {success: true}
    }
    else
    {
        return {success: false, failReason: "Either this user doesn't have a name-coloring role, or I don't have permission to edit their role."}
    }
}

let rolenameFunction: BotFunctionMeta = {
    id: "rolename",
    keys: ["rolename"],
    description: "Changes the name of this user's name-coloring role",
    usage: "!rolename <new name>",
    hidden: true,
    behavior: rolenameBehavior
}

export = rolenameFunction;