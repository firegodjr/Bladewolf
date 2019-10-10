import { User, Client } from "discord.js";
import { State } from "../state/botstate";

export interface Reminder{
    string: string;
    time: number;
    user: string;
    channel: string;
}

/**
 * Creates a new Reminder object
 * @param remindStr 
 * @param timeMinutes 
 * @param user 
 * @param channelID 
 */
export function makeReminder(remindStr: string, timeMinutes: number, user: User, channelID: string) {
    return { 
        string: remindStr,
        time: timeMinutes,
        user: String(user),
        channel: channelID
    }
}

export function checkReminders(reminderQueue: Reminder[]): boolean
{
    var currTime = new Date().getMinutes();
    var reminded = false;
    for(var i = 0; i < reminderQueue.length; ++i)
    {
        if(reminderQueue[i]["time"] < currTime)
        {
            // Do the reminder
            remind(reminderQueue[i]);
            // Delete the reminder
            reminderQueue.splice(i, 1);
            reminded = true;
        }
    }
    
    return reminded;
}

function remind(reminder: Reminder)
{
    var date = new Date();
    date.setMinutes(reminder["time"]);
    var message = reminder["user"] + "`, you asked me to remind you about ` " +
        reminder["string"] + " ` on " + date.getMonth() + "/" + date.getDay() + "/" + date.getFullYear() +
        " at " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes() + ".`";
    var channel = State.GetClient().channels.get(reminder["channel"]);
    if(channel != undefined)
    {
        channel.send(message); // Why TODO
    }
    else
    {
        console.log("Could not send reminder to channel " + reminder["channel"]);
    }
}