import { DMChannel, GroupDMChannel, TextChannel, User, Message } from "discord.js";
import { BotFunctionMeta, BotFunction, BotFunctionResult } from "./botfunction";
import botFunction = require("./help");
import { State } from "../state/botstate";
import { MergeArgsPast, Speak } from "../util/util";

const ACCUSATIONS_KEY = "accusations"

if(!State.GetDataStore().GetGlobalValue(ACCUSATIONS_KEY)) {
    State.GetDataStore().SetGlobalValue(ACCUSATIONS_KEY, {});
}

/**
 * Accuse a user of a crime
 */
function Accuse(channel: DMChannel | GroupDMChannel | TextChannel, user: User, crime: string)
{
    let crimeDictionary = State.GetDataStore().GetGlobalValue(ACCUSATIONS_KEY);
    if(!(user.tag in crimeDictionary))
    {
        crimeDictionary[user.tag] = [];
    }

    crimeDictionary[user.tag].push(crime);

    const userNick = user.username;
    channel.send("`" + userNick + " has been accused of` " + crime);
    State.SaveData();
}

let AccuseBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    var accusation = "";

    if(args.length >= 2)
    {
        let mention = message.mentions.users.last();
        if(mention != undefined)
        {
            accusation = MergeArgsPast(args, 1);
            Accuse(message.channel, mention, accusation);
        }
        else
        {
            Speak(channel, "Nobody found to accuse, have they been @tagged correctly?");
        }
    }
    else {
        return {success: false, failReason: "Not enough arguments (must be at least 2)"}
    }

    return {success: true}
}

/**
 * List all the crimes this user has been accused of
 * @param {string} channelID
 * @param {string} user
 */
function ListAccusations(channel: DMChannel | GroupDMChannel | TextChannel, user: User)
{
    let crimeDictionary = State.GetDataStore().GetGlobalValue(ACCUSATIONS_KEY);
    const userNick = user.username;
    var crime = "";
    if(user.tag in crimeDictionary)
    {
        var crimesLength = crimeDictionary[user.tag].length;
        if(crimesLength > 0)
        {
            for(var i = 0; i < crimesLength; ++i)
            {
                crime += "`" + (i + 1) + ".` " + crimeDictionary[user.tag][i] + "\n";
            }
            channel.send("`" + userNick + " has been accused of:`\n" + crime);
        }
    }
    else
    {
        Speak(channel, userNick + " is currently blameless.");
    }
}

let IncriminateBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    if(args.length == 0) {
        return { success: false, failReason: "Missing user argument" };
    }
    else if (args.length == 1 && message.mentions.users.size > 0) {
        let mention = message.mentions.users.first();
        if(mention != undefined) {
            console.log("Listing accusations of mentioned user " + mention.username + "...")
            ListAccusations(message.channel, mention);
        }
        else {
            Speak(channel, "I have no records for '" + args[1] +"'.");
        }
    }
    else if (args.length > 1) {
        return { success: false, failReason: "Too many arguments, did you mean '" + State.COMMAND_PREFIX + "accuse'?" };
    }
    else {
        return { success: false, failReason: "Argument must be an @user tag" };
    }

    return {success: true}
}


/**
 * Remove a single accusation
 */
function Pardon(channel: DMChannel | GroupDMChannel | TextChannel, sender: User, user: User, index: number)
{
    let crimeDictionary = State.GetDataStore().GetGlobalValue(ACCUSATIONS_KEY);

    // If the sender *is* the user being pardoned
    if(sender.tag == user.tag)
    {
        Speak(channel, "You cannot pardon yourself.");
    }
    else
    {
        if(user.tag in crimeDictionary && index >= 0 && index < crimeDictionary[user.tag].length)
        {
            channel.send("`" + user.username + " has been pardoned from` " + crimeDictionary[user.tag][index]);
            crimeDictionary[user.tag].splice(index, 1);
            State.SaveData();
        }
        else
        {
            Speak(channel, "That crime does not exist.");
            ListAccusations(channel, user);
        }
    }
}

let PardonBehavior: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult => {
    let crimeDictionary = State.GetDataStore().GetGlobalValue(ACCUSATIONS_KEY);
    let mention = message.mentions.users.first();
    var crimeID: number = parseInt(args[1]) - 1;

    if(args.length == 1)
    {
        if(mention) {
            ListAccusations(message.channel, mention);

            if(mention.tag in crimeDictionary)
            {
                Speak(channel, "Tell me to pardon this person again, with the number of the crime at the end of the command.");
                Speak(channel, "eg. ' !pardon @" + mention.tag + " 3 '");
            }
        }
        else {
            return {success: false, failReason: "No user was tagged (ex. @user)"}
        }
    }
    else if(args.length == 0)
    {
        Speak(channel, "Usage: !pardon <@user> <crime number>");
    }
    else
    {
        if(mention) {
            // Pardon with a -1 to make the list start at 0
            Pardon(channel, message.author, mention, crimeID);
        }
        else {
            return {success: false, failReason: "No user was tagged (ex. @user)"}
        }
    }
    return { success: true }
}

let accuseFunction: BotFunctionMeta = {
    id: "accuse",
    keys: ["accuse"],
    description: "Accuses a user of a crime",
    usage: "!accuse <@user> <crime>",
    behavior: AccuseBehavior
}

let incriminateFunction: BotFunctionMeta = {
    id: "incriminate",
    keys: ["incriminate"],
    description: "Lists this user's accusations for all to see",
    usage: "!incriminate <@user>",
    behavior: IncriminateBehavior
}

let pardonFunction: BotFunctionMeta = {
    id: "pardon",
    keys: ["pardon", "forgive"],
    description: "Pardons a user of a previous accusation",
    usage: "!pardon <@user> <accusation number>",
    behavior: PardonBehavior
}

export = [accuseFunction, incriminateFunction, pardonFunction]