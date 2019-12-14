import { BotFunctionMeta, BotFunction, BotFunctionResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PermManager, PermLevel } from "../state/permmgr";
import { Speak } from "../util";
import { State } from "../state/botstate";

let permBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    let validPermLevels: string[] = Object.keys(PermLevel).filter(x => !(parseInt(x) >= 0));
    switch(args[0]) {
        case "set":
            if(args.length > 1) {
                if(message.mentions.users.size > 0) { // Setting user perms
                    let enumFromStr: PermLevel;
                    let mention = message.mentions.users.first();
                    
                    if(args.length > 2 && validPermLevels.includes(args[2].toUpperCase())) {
                        let plArg = args[2].toUpperCase();
                        enumFromStr = PermLevel[plArg as keyof typeof PermLevel]
                    }
                    else {
                        return {success: false, failReason: "Invalid perm level, valid values are " + validPermLevels}
                    }
                    if(PermManager.SetUserPerms(channel as TextChannel, message.author, mention, enumFromStr)) {
                        Speak(channel, "Perm level of user " + mention.tag + " has been set to " + args[2].toUpperCase());
                        return {success: true}
                    }
                    else {
                        return {success: false, failReason: "You are not allowed to set this user's perm level to " + args[2]}
                    }
                }
                else if(State.GetFunctionByKey(args[1])) { // setting command perms
                    let enumFromStr: PermLevel = PermLevel.USER
                    if(args.length > 2 && validPermLevels.includes(args[2].toUpperCase())) {
                        let plArg = args[2].toUpperCase();
                        enumFromStr = PermLevel[plArg as keyof typeof PermLevel]
                        if(PermManager.SetFunctionPermLevel((channel as TextChannel).guild, message.author, args[1], enumFromStr)) {
                            Speak(channel, "Perm level of command " + args[1] + " has been set to " + args[2].toUpperCase());
                        }
                        else {
                            Speak(channel, "Setting command permission level failed. User's level must be above that of the command.")
                        }
                    }
                    else {
                        return {success: false, failReason: "Invalid perm level, valid values are " + validPermLevels}
                    }
                }
                else {
                    return {success: false, failReason: "Second argument must be either a user mention or valid command alias."}
                }
            }
            else {
                return {success: false, failReason: "Expected 3 arguments, but only got 1"}
            }
        break;
            

        case "get":
            let mention = message.mentions.users.first();
            if(mention) {
                Speak(channel, "This user has permission level " + validPermLevels[PermManager.GetUserPermLevelFromChannel(channel as TextChannel, mention)])
                return {success: true}
            }
            else if(State.GetFunctionByKey(args[1])) {
                Speak(channel, "This command requires permission level " + validPermLevels[PermManager.GetFunctionPermLevel((channel as TextChannel).guild, args[1])])
                return {success: true}
            }
            else return { success: false, failReason: "No user mentioned." }

        
        case "block": //Only for commands


        default:
            return {success: false, failReason: "Unknown argument '" + args[0] + "'"}
    }
    

    return { success: true }
}


let permFunction: BotFunctionMeta = {
    id: "permissions",
    keys: ["perm", "perms", "permission", "permissions"],
    behavior: permBehavior,
    description: "Allows setting or clearing bot permissions for a user or function",
    usage: "perm <get/set> <@user/function> <blocked/user/trusted/admin/op>"
}

export = permFunction;