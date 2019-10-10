"use strict";
var botstate_1 = require("../state/botstate");
var util_1 = require("../util");
var ACCUSATIONS_KEY = "accusations";
if (!botstate_1.State.GetDataStore().GetValue(ACCUSATIONS_KEY)) {
    botstate_1.State.GetDataStore().SetValue(ACCUSATIONS_KEY, {});
}
/**
 * Accuse a user of a crime
 */
function Accuse(channel, user, crime) {
    var crimeDictionary = botstate_1.State.GetDataStore().GetValue(ACCUSATIONS_KEY);
    if (!(user.tag in crimeDictionary)) {
        crimeDictionary[user.tag] = [];
    }
    crimeDictionary[user.tag].push(crime);
    var userNick = user.username;
    channel.send("`" + userNick + " has been accused of` " + crime);
    botstate_1.State.SaveData();
}
var AccuseBehavior = function (message, channel, args) {
    var accusation = "";
    if (args.length >= 2) {
        var mention = message.mentions.users.last();
        if (mention != undefined) {
            accusation = util_1.MergeArgsPast(args, 1);
            console.log("accusing " + mention.username + " of " + accusation + "...");
            Accuse(message.channel, mention, accusation);
        }
        else {
            util_1.Speak(channel, "I don't know who " + args[1] + " is, but I'm sure they deserve to be called out.");
        }
    }
    else {
        return { success: false, failReason: "Not enough arguments (must be at least 2)" };
    }
    return { success: true };
};
/**
 * List all the crimes this user has been accused of
 * @param {string} channelID
 * @param {string} user
 */
function ListAccusations(channel, user) {
    var crimeDictionary = botstate_1.State.GetDataStore().GetValue(ACCUSATIONS_KEY);
    var userNick = user.username;
    var crime = "";
    if (user.tag in crimeDictionary) {
        console.log("We have a record for " + userNick + "!");
        var crimesLength = crimeDictionary[user.tag].length;
        if (crimesLength > 0) {
            for (var i = 0; i < crimesLength; ++i) {
                crime += "`" + (i + 1) + ".` " + crimeDictionary[user.tag][i] + "\n";
            }
            channel.send("`" + userNick + " has been accused of:`\n" + crime);
        }
    }
    else {
        util_1.Speak(channel, userNick + " is currently blameless.");
    }
}
var IncriminateBehavior = function (message, channel, args) {
    if (args.length == 0) {
        return { success: false, failReason: "Missing user argument" };
    }
    else if (args.length == 1 && message.mentions.users.size > 0) {
        var mention = message.mentions.users.first();
        if (mention != undefined) {
            console.log("Listing accusations of mentioned user " + mention.username + "...");
            ListAccusations(message.channel, mention);
        }
        else {
            util_1.Speak(channel, "I have no records for '" + args[1] + "'.");
        }
    }
    else if (args.length > 1) {
        return { success: false, failReason: "Too many arguments" };
    }
    else {
        return { success: false, failReason: "Argument must be an @user tag" };
    }
    return { success: true };
};
/**
 * Remove a single accusation
 */
function Pardon(channel, sender, user, index) {
    var crimeDictionary = botstate_1.State.GetDataStore().GetValue(ACCUSATIONS_KEY);
    // If the sender *is* the user being pardoned
    if (sender.tag == user.tag) {
        util_1.Speak(channel, "You cannot pardon yourself.");
    }
    else {
        if (user.tag in crimeDictionary && index >= 0 && index < crimeDictionary[user.tag].length) {
            channel.send("`" + user.username + " has been pardoned from` " + crimeDictionary[user.tag][index]);
            crimeDictionary[user.tag].splice(index, 1);
            botstate_1.State.SaveData();
        }
        else {
            util_1.Speak(channel, "That crime does not exist.");
            ListAccusations(channel, user);
        }
    }
}
var PardonBehavior = function (message, channel, args) {
    var crimeDictionary = botstate_1.State.GetDataStore().GetValue(ACCUSATIONS_KEY);
    var mention = message.mentions.users.first();
    var crimeID = parseInt(args[2]) - 1;
    if (args.length == 1) {
        if (mention) {
            ListAccusations(message.channel, mention);
            if (mention.tag in crimeDictionary) {
                util_1.Speak(channel, "Tell me to pardon this person again, with the number of the crime at the end of the command.");
                util_1.Speak(channel, "eg. ' !pardon @" + mention.tag + " 3 '");
            }
        }
        else {
            return { success: false, failReason: "No user was tagged (ex. @user)" };
        }
    }
    else if (args.length == 0) {
        util_1.Speak(channel, "Usage: !pardon <@user> <crime number>");
    }
    else {
        if (mention) {
            // Pardon with a -1 to make the list start at 0
            console.log("Pardoning user " + mention.tag + " of crime " + crimeID);
            Pardon(channel, message.author, mention, crimeID);
        }
        else {
            return { success: false, failReason: "No user was tagged (ex. @user)" };
        }
    }
    return { success: true };
};
var accuseFunction = {
    keys: ["accuse"],
    description: "Accuses a user of a crime",
    usage: "!accuse <@user> <crime>",
    behavior: AccuseBehavior
};
var incriminateFunction = {
    keys: ["incriminate"],
    description: "Lists this user's accusations for all to see",
    usage: "!incriminate <@user>",
    behavior: IncriminateBehavior
};
var pardonFunction = {
    keys: ["pardon", "forgive"],
    description: "Pardons a user of a previous accusation",
    usage: "!pardon <@user> <accusation number>",
    behavior: PardonBehavior
};
module.exports = [accuseFunction, incriminateFunction, pardonFunction];
//# sourceMappingURL=accuse.js.map