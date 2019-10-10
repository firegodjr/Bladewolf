"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Discord = require('discord.js');
var BotState = /** @class */ (function () {
    function BotState() {
        this.behaviorKeywordMap = {};
        this.botFunctions = [];
    }
    BotState.prototype.GetClient = function () {
        if (!this._client) {
            this._client = new Discord.Client();
        }
        return this._client;
    };
    BotState.prototype.RegisterFunctionBehavior = function (func) {
        var _this = this;
        this.botFunctions.push(func);
        func.keys.forEach(function (key) {
            _this.behaviorKeywordMap[key] = _this.botFunctions.length - 1;
        });
    };
    BotState.prototype.GetRegisteredFunctions = function () {
        return this.botFunctions;
    };
    BotState.prototype.GetFunctionByKey = function (key) {
        return this.botFunctions[this.behaviorKeywordMap[key]];
    };
    BotState.prototype.ClearFunctions = function () {
        this.behaviorKeywordMap = {};
        this.botFunctions = [];
    };
    BotState.prototype.ExecuteBehavior = function (key, message, channel, args) {
        if (Object.keys(this.behaviorKeywordMap).includes(key)) {
            console.log("Attempting to execute behavior for key " + key);
            console.log("");
            this.GetFunctionByKey(key).behavior.call(this, message, channel, args);
            return true;
        }
        else {
            return false;
        }
    };
    return BotState;
}());
exports.State = new BotState();
//# sourceMappingURL=botstate.js.map