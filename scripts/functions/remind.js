"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botstate_1 = require("../state/botstate");
/**
 * Creates a new Reminder object
 * @param remindStr
 * @param timeMinutes
 * @param user
 * @param channelID
 */
function makeReminder(remindStr, timeMinutes, user, channelID) {
    return {
        string: remindStr,
        time: timeMinutes,
        user: String(user),
        channel: channelID
    };
}
exports.makeReminder = makeReminder;
function checkReminders(reminderQueue) {
    var currTime = new Date().getMinutes();
    var reminded = false;
    for (var i = 0; i < reminderQueue.length; ++i) {
        if (reminderQueue[i]["time"] < currTime) {
            // Do the reminder
            remind(reminderQueue[i]);
            // Delete the reminder
            reminderQueue.splice(i, 1);
            reminded = true;
        }
    }
    return reminded;
}
exports.checkReminders = checkReminders;
function remind(reminder) {
    var date = new Date();
    date.setMinutes(reminder["time"]);
    var message = reminder["user"] + "`, you asked me to remind you about ` " +
        reminder["string"] + " ` on " + date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear() +
        " at " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes() + ".`";
    var channel = botstate_1.State.GetClient().channels.get(reminder["channel"]);
    if (channel != undefined) {
        channel.send(message); // Why TODO
    }
    else {
        console.log("Could not send reminder to channel " + reminder["channel"]);
    }
}
//# sourceMappingURL=remind.js.map