"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../util");
var path_1 = require("path");
// Filesystem access
var fs = require('fs');
var PersistentDataStore = /** @class */ (function () {
    function PersistentDataStore() {
        this._data = {};
    }
    PersistentDataStore.prototype.GetValue = function (key) {
        return this._data[key];
    };
    PersistentDataStore.prototype.SetValue = function (key, value) {
        this._data[key] = value;
    };
    PersistentDataStore.prototype.SaveValuesToFile = function (path) {
        util_1.WriteFile(path, JSON.stringify(this._data));
    };
    PersistentDataStore.prototype.LoadValuesFromFile = function (path) {
        var data = util_1.ReadFile(path);
        if (data) {
            this._data = JSON.parse(data);
            console.log("Persistent data loaded from '" + path_1.resolve(path) + "'.");
        }
        else {
            console.log("Cannot load data from '" + path_1.resolve(path) + "'. Does the file exist?");
        }
    };
    return PersistentDataStore;
}());
exports.PersistentDataStore = PersistentDataStore;
//# sourceMappingURL=persistence.js.map