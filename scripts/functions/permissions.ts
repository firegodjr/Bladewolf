import { BotFunctionMeta, BotFunction, BotFunctionResult } from "./botfunction";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PermManager, PermLevel } from "../state/permmgr";
import { Speak } from "../util";
import { State } from "../state/botstate";
import { Behavior } from "../behavior";

function getValidPermLevels(): string[] {
    return Object.keys(PermLevel).filter(x => !(parseInt(x) >= 0));
}

function setPermBehavior(message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult {
    let validPermLevels: string[] = getValidPermLevels();
    if(args.length > 1) {
        if(message.mentions.users.size > 0) { // Setting user perms
            let enumFromStr: PermLevel;
            let mention = message.mentions.users.first();
            
            if(args.length > 2 && validPermLevels.includes(args[2].toUpperCase())) {
                let plArg = args[2].toUpperCase();
                enumFromStr = PermLevel[plArg as keyof typeof PermLevel]

                if(PermManager.SetUserPerms(channel as TextChannel, message.author, mention, enumFromStr)) {
                    Speak(channel, "Perm level of user " + mention.tag + " has been set to " + args[2].toUpperCase());
                    return {success: true}
                }
                else return {success: false, failReason: "You are not allowed to set this user's perm level to " + args[2]}
            }
            else return {success: false, failReason: "Invalid perm level, valid values are " + validPermLevels}
        }
        else if(State.GetFunctionByKey(args[1])) { // setting command perms
            let enumFromStr: PermLevel = PermLevel.USER
            if(args.length > 2 && validPermLevels.includes(args[2].toUpperCase())) {
                let plArg = args[2].toUpperCase();
                enumFromStr = PermLevel[plArg as keyof typeof PermLevel]
                if(PermManager.SetFunctionPermLevel((channel as TextChannel).guild, message.author, args[1], enumFromStr)) {
                    Speak(channel, "Perm level of command " + args[1] + " has been set to " + args[2].toUpperCase());
                    return {success: true}
                }
                else return {success: false, failReason: "Setting command permission level failed. User's level must be above that of the command."}
            }
            else return {success: false, failReason: "Invalid perm level, valid values are " + validPermLevels}
        }
        else return {success: false, failReason: "Second argument must be either a user mention or valid command alias."}
    }
    else return {success: false, failReason: "Expected 3 arguments, but only got 1"}
}

function getPermBehavior(message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]) {
    let validPermLevels: string[] = getValidPermLevels();
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
}

let perm = new Behavior(
    "permissions", 
    ["perm", "perms", "permissions"], 
    "Allows setting or clearing bot permissions for a user or function", 
    "perm <get/set> <@user/function> <blocked/user/trusted/admin/op>", 
    () => {return {success: false, failReason: "No arguments"}}
    );
let setPerm = new Behavior("set", ["set"], "Set the permissions of a user or command", "", setPermBehavior)
let getPerm = new Behavior("get", ["get"], "Gets the permissions of a user or command", "", getPermBehavior)

perm.addSubBehaviors([setPerm, getPerm]);

export = perm.toBotFunctionMeta()