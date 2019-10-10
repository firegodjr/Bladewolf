import { Channel, ChannelData, DMChannel, GroupDMChannel, User, Message, TextChannel } from "discord.js";
import { Reminder, makeReminder, checkReminders } from "./functions/remind";
import { State } from "./state/botstate";
import { BotFunction } from "./functions/botfunction";
import { Speak, Quote, MergeArgsPast, WriteFile } from "./util";
import { resolve } from "path";

let DATA_DIR = "../Data/"
let LOGS_DIR = "/logs/"

var Discord = require('discord.js');
const { Client, Attachment } = require('discord.js');
const client = State.GetClient();
var logger = require('winston');
var auth = require('../auth.json');

process.on("uncaughtException", State.SaveData)
process.on("exit", State.SaveData)

// Filesystem access
var fs = require('fs');

interface Dict<T>{
    [name: string]: T
}

interface BotPluginManifest {
    botPlugins: string[]
}

const COMMAND_PREFIX = "!";
const CRIMES_FILE = DATA_DIR + "accusations.json";
const COMMENDATIONS_FILE = DATA_DIR + "commendations.json";
const REMIND_FILE = DATA_DIR + "reminders.json";
var crimeDictionary: Dict<string[]> = {};
var commendDictionary: Dict<string[]> = {};

var reminderQueue: Reminder[] = [];

/**
 * Asynchronously loads all bot functions from files
 */
function LoadBotFunctions(): BotFunction[]
{
    console.log("Loading functions...");
    let functions: BotFunction[] = []

    let data = fs.readFileSync("./scripts/functions/manifest.json")
    let manifest = JSON.parse(data) as BotPluginManifest;
    console.log("Now loading functions: " + manifest.botPlugins)
    manifest.botPlugins.forEach((bf: string) => {
        console.log("Importing " + bf);
        try {
            // If this module is cached, reimport it to get the newest version
            if(require.cache[require.resolve("./functions/" + bf)]) {
                delete require.cache[require.resolve("./functions/" + bf)];
            }

            let m  = require("./functions/" + bf) as BotFunction | BotFunction[]
            if((m as BotFunction).behavior) {
                functions.push(m as BotFunction);
            }
            else if((m as BotFunction[])[0]) {
                let arr = m as BotFunction[];
                arr.forEach((func) => {
                    functions.push(func);
                });
            }

        } catch(e) {
            console.log("Something went wrong when trying to load " + bf + ": ", e)
        }
    });

    return functions;
}

/**
 * Registers functions with the global BotState object
 * @param botFunctions 
 */
function RegisterBotFunctions(botFunctions: BotFunction[]): void
{
    botFunctions.forEach((func) => {
        State.RegisterFunctionBehavior(func);
        console.log("Registered command: " + func.keys[0])
    });
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
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.startsWith(COMMAND_PREFIX))
    {
        console.log("Message recieved: '" + message.content + "'");
        var fullCommand = message.content.slice(COMMAND_PREFIX.length);
        var channel = message.channel;
        var args = fullCommand.split(' ');
        var cmd = args[0];
        var mention;

        try
        {
            if(!State.ExecuteBehavior(cmd.toLowerCase(), message, channel, args.slice(1))) {
                switch(cmd.toLowerCase()) {
                    case '$reloadfunctions':
                        Speak(channel, "Reloading functions in manifest...");
                        State.ClearFunctions()
                        let botFunctions = LoadBotFunctions();
                        RegisterBotFunctions(botFunctions);
                        Speak(channel, "...Done!");
                        break;

                    // Change the game that the bot is playing
                    case '$game':
                        if(args.length > 1)
                        {
                            var game = "";
                            for(var i = 1; i < args.length; ++i)
                            {
                                game += args[i] + " ";
                            }

                            client.user.setActivity(game.trim(), { type: "PLAYING" });
                            Speak(channel, "Game set to '" + game.trim() + "'");
                        }
                        break;

                    // Say something to the given channel
                    case '$adminsay':
                        var adminsay = MergeArgsPast(args, 2);
                        Speak(client.channels.get(args[1]), adminsay);
                        Speak(channel, "Saying: '" + adminsay + "'");
                        break;
                    
                    case '$supersay':
                        var supersay = MergeArgsPast(args, 2);
                        client.channels.get(args[1]).send(supersay);
                        break;

                    // Throw an error
                    case '$throw':
                        throw new Error("Test error. Hello!");
                        break;

                    // Unknown command
                    default:
                        if(!args[0].includes('!')) // If the command is just more '!'s, then it's probably Katie
                        {
                            Speak(channel, "I'm sorry, I'm not sure how to do that.");
                        }
                        break;
                }
            }
        } catch(error)
        {
            channel.send("`Error: " + error.message + "\nThis exception has been logged.`");
            var errorDate = new Date();
            var path = "./" + LOGS_DIR + errorDate.getMonth() + "-" + errorDate.getDay() + "-" + errorDate.getFullYear() + " " + errorDate.getHours() + errorDate.getMinutes() + ".txt";
            console.log("Logging to " + resolve(path));
            WriteFile(
                path,
                "Error: " + error.message + "\nStacktrace: " + error.stack
            );
        }
    }
});

//////////////////////////
// Finally, login
//////////////////////////


let botFunctions = LoadBotFunctions();
RegisterBotFunctions(botFunctions);
client.login(auth.token);
