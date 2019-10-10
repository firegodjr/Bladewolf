"use strict";
var util_1 = require("../util");
var rollBehavior = function (message, channel, args) {
    if (args.length < 2)
        return { success: false, failReason: "Not enough arguments" };
    if (args.length > 2)
        return { success: false, failReason: "Too many arguments" };
    // Get amount of dice to roll
    var amount = parseInt(args[0]);
    if (isNaN(amount))
        return { success: false, failReason: "First argument must be a number" };
    // Find amount of sides on the die
    var type = parseInt(args[1].slice(1));
    if (isNaN(type))
        return { success: false, failReason: "Unable to figure out how many sides a " + args[1] + " has. Is it a valid type of die? (ex. d20)" };
    // Do rolls
    var rolls = [];
    var total = 0;
    for (var i = 0; i < amount; ++i) {
        var roll = Math.floor(Math.random() * type) + 1;
        rolls.push(roll);
        total += roll;
    }
    var thingToSay = "Rolled " + amount + " d" + type + "s.";
    var possibleRolls = "\nRolls: " + rolls;
    if (possibleRolls.length < 1000) {
        thingToSay += "\nRolls: " + rolls.join(", ");
    }
    else {
        thingToSay += "\nRolls: (Too many rolls to list)";
    }
    thingToSay += "\nTotal: " + total;
    util_1.Speak(channel, thingToSay);
    return { success: true };
};
var rollFunction = {
    keys: ["roll"],
    description: "Rolls some dice",
    usage: "!roll <# of dice> <type of dice (Ex. d10)>",
    behavior: rollBehavior
};
module.exports = rollFunction;
//# sourceMappingURL=roll.js.map