import { DMChannel, GroupDMChannel, TextChannel, Message, Client } from "discord.js";
import { resolve } from "path";
import { State } from "./state/botstate";
import { BotFunction } from "./functions/botfunction";
var fs = require('fs');

interface BotPluginManifest {
    botPlugins: string[]
}

export interface Dictionary<T> {
    [key: string]: T
}

export function ReadFile(path: string): string {
    let output = "";
    output = fs.readFileSync("./" + path);
    return output;
}

export function WriteFile(path: string, data: string): void {
    fs.writeFile("./" + path, data, { flag: 'w' }, (err: Error) => { });
}

/**
 * Asynchronously loads all bot functions from files
 */
export function LoadBotFunctions(): BotFunction[]
{
    console.log("Loading functions from " + resolve(State.MANIFEST_FILE));
    let functions: BotFunction[] = []

    let data = fs.readFileSync(State.MANIFEST_FILE)
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
export function RegisterBotFunctions(botFunctions: BotFunction[]): void
{
    botFunctions.forEach((func) => {
        State.RegisterFunctionBehavior(func);
        console.log("Registered command: " + func.keys[0])
    });
}

export function ParseMessage(client: Client, message: Message) {
    let commandPrefix = State.COMMAND_PREFIX;
    if (message.content.startsWith(commandPrefix))
    {
        console.log("Message recieved: '" + message.content + "'");
        var fullCommand = message.content.slice(commandPrefix.length);
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
                    // case '$adminsay':
                    //     var adminsay = MergeArgsPast(args, 2);
                    //     Speak(client.channels.get(args[1]), adminsay);
                    //     Speak(channel, "Saying: '" + adminsay + "'");
                    //     break;
                    
                    // case '$supersay':
                    //     var supersay = MergeArgsPast(args, 2);
                    //     client.channels.get(args[1]).send(supersay);
                    //     break;

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
            var path = "./" + State.LOGS_DIR + errorDate.getMonth() + "-" + errorDate.getDay() + "-" + errorDate.getFullYear() + " " + errorDate.getHours() + errorDate.getMinutes() + ".txt";
            console.log("Logging to " + resolve(path));
            WriteFile(
                path,
                "Error: " + error.message + "\nStacktrace: " + error.stack
            );
        }
    }
}

/**
  * Combines all arguments past the given index into a single string
  */
 export function MergeArgsPast(args: string[], index: number)
 {
     var merged = "";
     for(var i = index; i < args.length; ++i)
     {
         merged += args[i] + " ";
     }
     return merged.trim();
 }
 
 /**
  * Quote a user's message, without code quotes
  */
 export function Quote(channel: DMChannel | GroupDMChannel | TextChannel, thingToSay: string)
 {
     channel.send("`>>> ` " + thingToSay);
 }
 
 /**
  * Speak with code quotes like a robot should
  */
 export function Speak(channel: DMChannel | GroupDMChannel | TextChannel, thingToSay: string)
 {
     channel.send("`>>> " + thingToSay + "`");
 }