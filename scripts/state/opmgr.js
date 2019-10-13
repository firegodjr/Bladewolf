"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botstate_1 = require("./botstate");
var util_1 = require("../util");
var PERM_KEY = "perms";
var PermLevel;
(function (PermLevel) {
    PermLevel[PermLevel["BLOCKED"] = 0] = "BLOCKED";
    PermLevel[PermLevel["USER"] = 1] = "USER";
    PermLevel[PermLevel["TRUSTED"] = 2] = "TRUSTED";
    PermLevel[PermLevel["ADMIN"] = 3] = "ADMIN";
    PermLevel[PermLevel["OP"] = 4] = "OP";
})(PermLevel = exports.PermLevel || (exports.PermLevel = {}));
var OpManager = /** @class */ (function () {
    function OpManager() {
    }
    /**
     * Returns the permission level of the user
     */
    OpManager.GetUserPermLevel = function (channel, user) {
        if (!channel.guild || channel.guild.ownerID == user.id)
            return PermLevel.OP;
        var dataStore = botstate_1.State.GetDataStore();
        var GUILD_KEY = PERM_KEY + channel.guild.id;
        if (!dataStore.GetValue(GUILD_KEY)) {
            dataStore.SetValue(GUILD_KEY, { userPermOverrides: {} });
            botstate_1.State.SaveData();
            util_1.Speak(channel, "No existing user metadata for this server found. Creating data...");
        }
        var userPerms = botstate_1.State.GetDataStore().GetValue(PERM_KEY + channel.guild.id).userPermOverrides;
        var data = userPerms[user.id];
        if (data) {
            return data.permLevel;
        }
        else {
            return PermLevel.USER;
        }
    };
    /**
     * Sets a user perms with the referral of an existing admin or higher user
     * @param refUser
     * @param newOp
     */
    OpManager.SetUserPerms = function (channel, refUser, newOp, newPermLevel) {
        var userLevel = this.GetUserPermLevel(channel, refUser);
        var changedUserLevel = this.GetUserPermLevel(channel, newOp);
        var dataStore = botstate_1.State.GetDataStore();
        if (userLevel >= PermLevel.ADMIN && userLevel > changedUserLevel) {
            var GUILD_KEY = PERM_KEY + channel.guild.id;
            if (!dataStore.GetValue(GUILD_KEY)) {
                dataStore.SetValue(GUILD_KEY, { userPermOverrides: {} });
                util_1.Speak(channel, "No existing user metadata for this server found. Creating data...");
            }
            var guildData = dataStore.GetValue(GUILD_KEY);
            var userPerms = guildData.userPermOverrides;
            var user = userPerms[newOp.id];
            if (!user) {
                user = {
                    permLevel: newPermLevel
                };
            }
            else {
                user.permLevel = newPermLevel;
            }
        }
        else {
            return false;
        }
        botstate_1.State.SaveData();
        return true;
    };
    return OpManager;
}());
exports.OpManager = OpManager;
//# sourceMappingURL=opmgr.js.map