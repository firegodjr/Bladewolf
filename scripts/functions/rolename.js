"use strict";
var util_1 = require("../util");
var rolenameBehavior = function (message, channel, args) {
    var role = message.guild.roles.get(message.member.colorRole.id);
    if (role != undefined && role.editable) {
        var roleName = util_1.MergeArgsPast(args, 1);
        role.edit({ name: roleName });
        util_1.Speak(channel, "Your role is now '" + roleName + "'");
        return { success: true };
    }
    else {
        return { success: false, failReason: "Either this user doesn't have a name-coloring role, or I don't have permission to edit their role." };
    }
};
var rolenameFunction = {
    keys: ["rolename"],
    description: "Changes the name of this user's name-coloring role",
    usage: "!rolename <new name>",
    behavior: rolenameBehavior
};
module.exports = rolenameFunction;
//# sourceMappingURL=rolename.js.map