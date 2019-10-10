"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var botstate_1 = require("./state/botstate");
var util_1 = require("./util");
var path_1 = require("path");
var DATA_DIR = "../Data/";
var LOGS_DIR = "/logs/";
var Discord = require('discord.js');
var _a = require('discord.js'), Client = _a.Client, Attachment = _a.Attachment;
var client = botstate_1.State.GetClient();
var logger = require('winston');
var auth = require('../auth.json');
process.on("uncaughtException", botstate_1.State.SaveData);
process.on("exit", botstate_1.State.SaveData);
// Filesystem access
var fs = require('fs');
var COMMAND_PREFIX = "!";
var CRIMES_FILE = DATA_DIR + "accusations.json";
var COMMENDATIONS_FILE = DATA_DIR + "commendations.json";
var REMIND_FILE = DATA_DIR + "reminders.json";
var crimeDictionary = {};
var commendDictionary = {};
var reminderQueue = [];
/**
 * Asynchronously loads all bot functions from files
 */
function LoadBotFunctions() {
    console.log("Loading functions...");
    var functions = [];
    var data = fs.readFileSync("./scripts/functions/manifest.json");
    var manifest = JSON.parse(data);
    console.log("Now loading functions: " + manifest.botPlugins);
    manifest.botPlugins.forEach(function (bf) {
        console.log("Importing " + bf);
        try {
            // If this module is cached, reimport it to get the newest version
            if (require.cache[require.resolve("./functions/" + bf)]) {
                delete require.cache[require.resolve("./functions/" + bf)];
            }
            var m = require("./functions/" + bf);
            if (m.behavior) {
                functions.push(m);
            }
            else if (m[0]) {
                var arr = m;
                arr.forEach(function (func) {
                    functions.push(func);
                });
            }
        }
        catch (e) {
            console.log("Something went wrong when trying to load " + bf + ": ", e);
        }
    });
    return functions;
}
function RegisterBotFunctions(botFunctions) {
    botFunctions.forEach(function (func) {
        botstate_1.State.RegisterFunctionBehavior(func);
        console.log("Registered command: " + func.keys[0]);
    });
}
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// On bot login
client.on('ready', function () {
    console.log("Ready!");
    client.user.setActivity("!help for help", { type: "WATCHING" });
});
// On message reception
client.on('message', function (message) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.content.startsWith(COMMAND_PREFIX)) {
        console.log("Message recieved: '" + message.content + "'");
        var fullCommand = message.content.slice(COMMAND_PREFIX.length);
        var channel = message.channel;
        var args = fullCommand.split(' ');
        var cmd = args[0];
        var mention;
        try {
            if (!botstate_1.State.ExecuteBehavior(cmd.toLowerCase(), message, channel, args.slice(1))) {
                switch (cmd.toLowerCase()) {
                    case '$reloadfunctions':
                        util_1.Speak(channel, "Reloading functions in manifest...");
                        botstate_1.State.ClearFunctions();
                        var botFunctions_1 = LoadBotFunctions();
                        RegisterBotFunctions(botFunctions_1);
                        util_1.Speak(channel, "...Done!");
                        break;
                    // Change the game that the bot is playing
                    case '$game':
                        if (args.length > 1) {
                            var game = "";
                            for (var i = 1; i < args.length; ++i) {
                                game += args[i] + " ";
                            }
                            client.user.setActivity(game.trim(), { type: "PLAYING" });
                            util_1.Speak(channel, "Game set to '" + game.trim() + "'");
                        }
                        break;
                    // Say something to the given channel
                    case '$adminsay':
                        var adminsay = util_1.MergeArgsPast(args, 2);
                        util_1.Speak(client.channels.get(args[1]), adminsay);
                        util_1.Speak(channel, "Saying: '" + adminsay + "'");
                        break;
                    case '$supersay':
                        var supersay = util_1.MergeArgsPast(args, 2);
                        client.channels.get(args[1]).send(supersay);
                        break;
                    // Throw an error
                    case '$throw':
                        throw new Error("Test error. Hello!");
                        break;
                    // Unknown command
                    default:
                        if (!args[0].includes('!')) // If the command is just more '!'s, then it's probably Katie
                         {
                            util_1.Speak(channel, "I'm sorry, I'm not sure how to do that.");
                        }
                        break;
                }
            }
        }
        catch (error) {
            channel.send("`Error: " + error.message + "\nThis exception has been logged.`");
            var errorDate = new Date();
            var path = "./" + LOGS_DIR + errorDate.getMonth() + "-" + errorDate.getDay() + "-" + errorDate.getFullYear() + " " + errorDate.getHours() + errorDate.getMinutes() + ".txt";
            console.log("Logging to " + path_1.resolve(path));
            util_1.WriteFile(path, "Error: " + error.message + "\nStacktrace: " + error.stack);
        }
    }
});
//////////////////////////
// Finally, login
//////////////////////////
var botFunctions = LoadBotFunctions();
RegisterBotFunctions(botFunctions);
client.login(auth.token);
//# sourceMappingURL=bot.js.map