import { BotFunctionBehavior, BehaviorResult, BotFunction } from "./botfunction"
import { Message, Channel } from "discord.js"
import { sheetsBehavior } from "./dungeoneer/sheets"
import { rollBehavior } from "./dungeoneer/roll"


let sheets: BotFunction = {
    id: "sheets",
    keys: ["sheet5e", "sheets5e"],
    description: "Allows the user to manage their 5e character sheets",
    usage: "!sheets5e list, !sheets5e add <name>, !sheets5e remove <name>",
    behavior: sheetsBehavior,
    hidden: true
}

let rollFunction: BotFunction = {
    id: "roll",
    keys: ["roll"],
    description: "Rolls some dice",
    usage: "!roll <# of dice> <type of dice (Ex. 3 d10 or 3d10)>",
    behavior: rollBehavior
}

export = [sheets, rollFunction]