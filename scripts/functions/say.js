"use strict";
var util_1 = require("../util");
var say = function (message, channel, args) {
    var thingToSay = "";
    for (var i = 0; i < args.length; ++i) {
        thingToSay += args[i] + " ";
    }
    util_1.Quote(message.channel, thingToSay);
    return { success: true };
};
var botFunction = {
    keys: ["say", "echo", "repeat"],
    description: "Simply repeats what you type after the command",
    usage: "!say <text>",
    behavior: say
};
module.exports = botFunction;
//# sourceMappingURL=say.js.map