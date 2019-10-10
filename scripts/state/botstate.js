"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var persistence_1 = require("./persistence");
var util_1 = require("../util");
var opmgr_1 = require("./opmgr");
var Discord = require('discord.js');
var fs = require('fs');
/**
 * Singleton module that handles all state-related functionality
 */
var BotState = /** @class */ (function () {
    function BotState() {
        this._behaviorKeywordMap = {};
        this._botFunctions = [];
        this._data = new persistence_1.PersistentDataStore();
        this._DATA_STORE_FILE = "Data/botData.json";
        if (!util_1.ReadFile(this._DATA_STORE_FILE)) {
            util_1.WriteFile(this._DATA_STORE_FILE, "{}");
        }
        this._data.LoadValuesFromFile(this._DATA_STORE_FILE);
    }
    /**
     * Saves all data to the predefined default botData.json file
     */
    BotState.prototype.SaveData = function () {
        if (this._data) {
            this._data.SaveValuesToFile(this._DATA_STORE_FILE);
        }
    };
    BotState.prototype.GetDataStore = function () {
        return this._data;
    };
    BotState.prototype.GetClient = function () {
        if (!this._client) {
            this._client = new Discord.Client();
        }
        return this._client;
    };
    BotState.prototype.RegisterFunctionBehavior = function (func) {
        var _this = this;
        this._botFunctions.push(func);
        func.keys.forEach(function (key) {
            _this._behaviorKeywordMap[key] = _this._botFunctions.length - 1;
        });
    };
    BotState.prototype.GetRegisteredFunctions = function () {
        return this._botFunctions;
    };
    BotState.prototype.GetFunctionByKey = function (key) {
        return this._botFunctions[this._behaviorKeywordMap[key]];
    };
    BotState.prototype.ClearFunctions = function () {
        this._behaviorKeywordMap = {};
        this._botFunctions = [];
    };
    /**
     * Executes a dynamically-loaded command, if allowed by user permissions
     * @param key Command provided by user
     * @param message Message containing the command
     * @param channel The channel containing the command
     * @param args Arguments after the command
     * @returns True if this command was correctly handled
     */
    BotState.prototype.ExecuteBehavior = function (key, message, channel, args) {
        if (Object.keys(this._behaviorKeywordMap).includes(key)) {
            console.log("Attempting to execute behavior for key " + key);
            var func = this.GetFunctionByKey(key);
            var permLevel = func.permLevel;
            if (!permLevel) {
                permLevel = opmgr_1.PermLevel.USER;
            }
            if (opmgr_1.OpManager.GetUserPermLevel(channel, message.author) < permLevel) {
                util_1.Speak(channel, "You do not have permission to perform this command.");
            }
            else {
                var result = func.behavior(message, channel, args);
                console.log(result);
                if (!result.success) {
                    util_1.Speak(channel, "Command failed: " + key);
                    if (result.failReason) {
                        util_1.Speak(channel, "Reason: " + result.failReason);
                    }
                }
            }
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