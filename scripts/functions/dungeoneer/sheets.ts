import { User, Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js"
import { State } from "../../state/botstate"
import { BotFunctionBehavior, BehaviorResult } from "../botfunction"
import { Speak } from "../../util"
import { Stat, Advantage } from "./stats"
import { rollDice } from "./roll"

const sheets_key = "5e_character_sheets"
const primary_sheet_key = "5e_current_sheet"

interface StatCheckResult {
    rolls: number[],
    modifier: number,
    result: number
}


class Sheet {
    name: string = ""
    stats: Stat[] = []
    proficiency: number = 0

    constructor(name: string) {
        this.name = name;
        this.stats = [
            new Stat("Strength", "STR", 0),
            new Stat("Dexterity", "DEX", 0),
            new Stat("Constitution", "CON", 0),
            new Stat("Intelligence", "INT", 0),
            new Stat("Wisdom", "WIS", 0),
            new Stat("Charisma", "CHA", 0),
        ];
    }

    getStat(name: string): Stat | undefined {
        name = name.toLowerCase();
        for(let i = 0; i < this.stats.length; ++i) {
            if(this.stats[i].name.toLowerCase() == name || this.stats[i].shorthand.toLowerCase() == name) {
                return this.stats[i];
            }
        }

        return undefined;
    }

    setStat(name: string, value: number) {
        let stat = this.getStat(name);
        if(stat != undefined) {
            stat.setValue(value);
            return true;
        }
        else return false;
    }

    statCheck(name: string, adv: Advantage): StatCheckResult | undefined {
        let stat = this.getStat(name);
        let dice = rollDice(2, 20)

        if(stat != undefined) {
            if(adv == Advantage.NORMAL) {
                return {
                    rolls: [dice.rolls[0]], 
                    modifier: stat.modifier, 
                    result: dice.rolls[0] + stat.modifier
                }
            }
            else if(adv == Advantage.ADVANTAGE) {
                return {
                    rolls: dice.rolls, 
                    modifier: stat.modifier, 
                    result: Math.max(...dice.rolls) + stat.modifier
                }
            }
            else if(adv == Advantage.DISADVANTAGE) {
                return {
                    rolls: dice.rolls, 
                    modifier: stat.modifier, 
                    result: Math.min(...dice.rolls) + stat.modifier
                }
            }
        }
        
        return undefined;
    }
}

interface Spell {
    name: string
}

function sheetsList(user: User, channel: TextChannel | DMChannel | GroupDMChannel): BehaviorResult {
    let listStr = "";
    let sheets = getUserSheets(user);
    for(let i = 0; i < sheets.length; ++i) {
        listStr += i + ": " + sheets[i].name + "\n";
    } 
    Speak(channel, listStr);
    return {success: true}
}

function sheetsAdd(user: User, channel: TextChannel | DMChannel | GroupDMChannel, sheetName: string): BehaviorResult {
    let sheet = new Sheet(sheetName)
    let sheets = getUserSheets(user);
    sheets.push(sheet);
    Speak(channel, "Added new sheet '" + sheetName + "'");
    State.SaveData();
    return {success: true}
}

function sheetsRemove(user: User, channel: TextChannel | DMChannel | GroupDMChannel, sheetName: string): BehaviorResult {
    let sheets = getUserSheets(user);
    for(let i = 0; i < sheets.length; ++i) {
        if(sheets[i].name == sheetName) {
            sheets.splice(i);
            Speak(channel, "Removed sheet '" + sheetName + "'");
            return {success: true}
        }
    }
    return {success: false, failReason: "No sheet with name '" + sheetName + "'"}
}

function sheetsSet(user: User, channel: TextChannel | DMChannel | GroupDMChannel, sheetName: string): BehaviorResult {
    let sheet = getUserSheet(user, sheetName);
    if(sheet != undefined) {
        State.GetDataStore().SetUserValue(user, primary_sheet_key, sheetName);
        Speak(channel, "Primary sheet set to '" + sheetName + "'");
        return {success: true};
    }
    else return {success: false, failReason: "A sheet with that name does not exist."}
}

function sheetsSetStat(user: User, channel: TextChannel | DMChannel | GroupDMChannel, stat: string, value: number): BehaviorResult {
    let sheet = getPrimarySheet(user);
    if(sheet != undefined) {
        let statObj = sheet.getStat(stat);
        if(sheet.setStat(stat, value)) {
            Speak(channel, "Set '" + stat + "' to " + value + ".");
            return {success: true}
        }
        else {
            return {success: false, failReason: "Stat '" + stat + "' does not exist"}
        }
    }
    else return {success: false, failReason: "No primary sheet set."}
}

function sheetsCheck(user: User, channel: TextChannel | DMChannel | GroupDMChannel): BehaviorResult {
    return {success: true}
}

export let sheetsBehavior: BotFunctionBehavior = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult => {
    if(args.length == 0) return {success: false, failReason: "Missing arguments"}
    switch(args[0].toLowerCase()) {

        case "list":
            return sheetsList(message.author, channel);

        case "add":
            if(args.length > 1) {
                return sheetsAdd(message.author, channel, args[1]);
            }
            else return {success: false, failReason: "No sheet name provided."}

        case "remove":
            if(args.length > 1) {
                return sheetsRemove(message.author, channel, args[1])
            }
            else return {success: false, failReason: "No sheet name provided."}

        case "roll":
            if(args.length > 1) {
                let sheet = getPrimarySheet(message.author)

                if(sheet != undefined) {
                    let adv: Advantage = Advantage.NORMAL
                    if(args.length > 2) {
                        adv = Advantage[args[2].toUpperCase() as keyof typeof Advantage]
                    }

                    let checkResult = sheet.statCheck(args[1], adv)
                    if(checkResult != undefined) {
                        let str = "Rolls: " + checkResult.rolls.join(", ") + "\n" + "Modifier: " + checkResult.modifier + "\n" + "Result: " + checkResult.result + "\n"
                        Speak(channel, str);
                        return {success: true}
                    }
                    else return {success: false, failReason: "'" + args[1] +"' is not a stat."}
                }
                else return {success: false, failReason: "No primary sheet set"}
            }
            else return {success: false, failReason: "No stat provided in command"}

        case "setsheet":
            if(args.length > 1) {
                return sheetsSet(message.author, channel, args[1])
            }
            else return {success: false, failReason: "No sheet name provided."}
        
        case "set":
            if(args.length > 2) {
                return sheetsSetStat(message.author, channel, args[1], parseInt(args[2]))
            }
            else return {success: false, failReason: "Command requires stat name and new value."}
    }

    return {success: true}
}

function getUserSheets(user: User): Sheet[] {
    let dataStore = State.GetDataStore();
    let sheets = dataStore.GetUserValue(user, sheets_key);
    if(sheets == undefined) {
        State.GetDataStore().SetUserValue(user, sheets_key, [])
        return [];
    }

    return sheets;
}

function getUserSheet(user: User, name: string): Sheet | undefined {
    let sheets = getUserSheets(user);
    for(let i = 0; i < sheets.length; ++i) {
        if(sheets[i].name.toLowerCase() == name.toLowerCase()) {
            return sheets[i];
        }
    }

    return undefined;
}

function getPrimarySheet(user: User): Sheet | undefined {
    let primary_sheet = State.GetDataStore().GetUserValue(user, primary_sheet_key);
    if(primary_sheet == undefined) {
        console.log("No primary sheet exists");
        State.GetDataStore().SetUserValue(user, primary_sheet_key, "")
        primary_sheet = "";
    }

    if(primary_sheet != "") {
        let sheet = getUserSheet(user, primary_sheet);
        if(sheet == undefined) {
            console.log("No sheet exists to match the primary");
            State.GetDataStore().SetUserValue(user, primary_sheet_key, "")
        }
        else {
            return getUserSheet(user, primary_sheet);
        }
    }

    return undefined;
}