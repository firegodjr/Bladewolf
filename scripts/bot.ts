import { Channel, ChannelData, DMChannel, GroupDMChannel, User, Message, TextChannel } from "discord.js";
import { Reminder, makeReminder, checkReminders } from "./functions/remind";
import { State } from "./state/botstate";
import { BotFunction } from "./functions/botfunction";
import { Speak, Quote, MergeArgsPast, WriteFile, LoadBotFunctions, RegisterBotFunctions } from "./util/util";
import { resolve } from "path";
import { ParseMessage } from "./util/commandparser";

let DATA_DIR = "../Data/"

var Discord = require('discord.js');
const { Client, Attachment } = require('discord.js');
const client = State.GetClient();
var logger = require('winston');
var auth = require('../auth.json');

process.on("uncaughtException", State.SaveData);
process.on("SIGINT", State.SaveData);

interface Dict<T>{
    [name: string]: T
}

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// On bot login
client.on('ready', () => {
    console.log("Ready!");
    client.user.setActivity("!help for help", { type: "WATCHING" });
});

// On message reception
client.on('message', (message: Message) => {
    ParseMessage(client, message);
});


//////////////////////////
// Finally, login
//////////////////////////
let botFunctions = LoadBotFunctions();
RegisterBotFunctions(botFunctions);
client.login(auth.token);
