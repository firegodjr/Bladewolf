import { BotFunction, BotFunctionBehavior, BehaviorResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PermManager, PermLevel } from "../state/permmgr";
import { Speak } from "../util";

let permBehavior: BotFunctionBehavior = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult => {
    let validPermLevels: string[] = Object.keys(PermLevel).filter(x => !(parseInt(x) >= 0));
    switch(args[0]) {
        case "set":
            if(args.length > 1 && message.mentions.users.size > 0) {
                let enumFromStr: PermLevel;
                let mention = message.mentions.users.first();
                
                if(args.length > 2 && validPermLevels.includes(args[2])) {
                    enumFromStr = PermLevel[(args[2].toUpperCase()) as keyof typeof PermLevel]
                }
                else {
                    return {success: false, failReason: "Perm level missing, valid values are " + validPermLevels}
                }
                if(PermManager.SetUserPerms(channel as TextChannel, message.author, mention, enumFromStr)) {
                    Speak(channel, "Role of user " + mention.tag + " has been set to " + args[2]);
                    return {success: true}
                }
                else {
                    return {success: false, failReason: "You are unable to set this user's permissions."}
                }
            }
            else {
                return {success: false, failReason: "No user mentioned in perm change message"}
            }
            

        case "get":
            let mention = message.mentions.users.first();
            if(mention) {
                Speak(channel, "This user has permission level " + validPermLevels[PermManager.GetUserPermLevelFromChannel(channel as TextChannel, mention)])
                return {success: true}
            }
            else return { success: false, failReason: "No user mentioned." }

            
        default:
            return {success: false, failReason: "Unknown argument '" + args[0] + "'"}
    }
    

    return { success: true }
}


let permFunction: BotFunction = {
    id: "permissions",
    keys: ["perm", "perms", "permission", "permissions"],
    behavior: permBehavior,
    description: "Allows setting or clearing bot permissions for a user",
    usage: "perm <get/set> <@user> <blocked/user/admin/op>"
}

export = permFunction