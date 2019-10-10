"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botstate_1 = require("./botstate");
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
        if (this.GetUserPermLevel(channel, refUser) >= PermLevel.ADMIN) {
            var userPerms = botstate_1.State.GetDataStore().GetValue(PERM_KEY + channel.guild.id).userPermOverrides;
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
        botstate_1.State.SaveData();
    };
    return OpManager;
}());
exports.OpManager = OpManager;
//# sourceMappingURL=opmgr.js.map