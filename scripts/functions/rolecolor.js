"use strict";
var util_1 = require("../util");
var setRoleColor = function (message, channel, args) {
    var role = message.guild.roles.get(message.member.colorRole.id);
    if (role != undefined && role.editable) {
        var hexColor = args[0];
        var validHex = hexColor.match("[g-zG-Z]") == null;
        if (!hexColor.startsWith("#")) {
            util_1.Speak(channel, "Please enter a hex number. ex: #0f0ac3");
            return { success: false };
        }
        else if (hexColor.endsWith("000000")) {
            return { success: false, failReason: "Unable to apply solid black names" };
        }
        else if (!validHex) {
            return { success: false, failReason: "Invalid hexadecimal" };
        }
        else if (role != undefined) {
            role.edit({ color: hexColor }).catch(function (e) {
                return util_1.Speak(message.channel, "Error: unable to edit user's role.");
            });
            util_1.Speak(channel, "Set the role '" + role.name + "' color to " + args[0]);
        }
    }
    else {
        return { success: false, failReason: "Either this user doesn't have a name-coloring role, or I don't have permission to edit their role." };
    }
    return { success: true };
};
var botFunction = {
    keys: ["rolecolor", "color", "colorme"],
    description: "Changes the color of your name-coloring role",
    usage: "!rolecolor <hex color, ex. #4bec13>",
    behavior: setRoleColor
};
module.exports = botFunction;
//# sourceMappingURL=rolecolor.js.map