import { DMChannel, GroupDMChannel, TextChannel } from "discord.js";
import { resolve } from "path";
var fs = require('fs');

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