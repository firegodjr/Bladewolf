import { DMChannel, GroupDMChannel, TextChannel, Message, Client } from "discord.js";
import { resolve } from "path";
import { State } from "../state/botstate";
import { BotFunction } from "../functions/botfunction";
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

    let data: string = "{botPlugins: []}";
    try {
        data = fs.readFileSync(State.MANIFEST_FILE);
    }
    catch(err) {
        console.log("Error reading plugin manifest: ", err);
    }

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
            else {
                console.log(`Unable to load botfunction ${bf}, check that it is exported correctly.`);
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