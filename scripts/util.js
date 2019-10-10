"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
function ReadFile(path) {
    var output = "";
    output = fs.readFileSync("./" + path);
    return output;
}
exports.ReadFile = ReadFile;
function WriteFile(path, data) {
    fs.writeFile("./" + path, data, { flag: 'w' }, function (err) { });
}
exports.WriteFile = WriteFile;
/**
  * Combines all arguments past the given index into a single string
  */
function MergeArgsPast(args, index) {
    var merged = "";
    for (var i = index; i < args.length; ++i) {
        merged += args[i] + " ";
    }
    return merged.trim();
}
exports.MergeArgsPast = MergeArgsPast;
/**
 * Quote a user's message, without code quotes
 */
function Quote(channel, thingToSay) {
    channel.send("`>>> ` " + thingToSay);
}
exports.Quote = Quote;
/**
 * Speak with code quotes like a robot should
 */
function Speak(channel, thingToSay) {
    channel.send("`>>> " + thingToSay + "`");
}
exports.Speak = Speak;
//# sourceMappingURL=util.js.map