"use strict";
var util_1 = require("../util");
var botstate_1 = require("../state/botstate");
var opmgr_1 = require("../state/opmgr");
var help = function (message, channel, args) {
    var thingToSay = "";
    var botFunctions = botstate_1.State.GetRegisteredFunctions();
    if (args.length == 0) {
        thingToSay += "All Bot Functions (Say !help <function> for specific help)\n";
        botFunctions.forEach(function (bf) {
            if (!bf.hidden) {
                thingToSay += "> !" + bf.keys[0];
                if (bf.description) {
                    thingToSay += " - " + bf.description;
                }
                thingToSay += "\n";
            }
        });
    }
    else {
        var bf = botstate_1.State.GetFunctionByKey(args[0]);
        if (bf && !bf.hidden) {
            thingToSay += "Function: " + bf.keys[0] + "\n";
            thingToSay += "Aliases: " + bf.keys.join(", ") + "\n";
            if (bf.usage)
                thingToSay += "Usage: " + bf.usage + "\n";
            if (bf.description)
                thingToSay += "Description: " + bf.description + "\n";
            thingToSay += "Required permission level: " + opmgr_1.PermLevel[bf.permLevel || opmgr_1.PermLevel.USER] + "\n";
        }
        else {
            thingToSay = "There is no command with alias '" + args[0] + "'";
        }
    }
    util_1.Speak(message.channel, thingToSay);
    return { success: true };
};
var botFunction = {
    keys: ["help"],
    description: "Explains the bot functions in detail",
    usage: "!help, !help <function>",
    behavior: help
};
module.exports = botFunction;
//# sourceMappingURL=help.js.map