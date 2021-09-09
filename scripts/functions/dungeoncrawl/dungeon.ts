import { Behavior } from "../../behavior";
import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { BotFunction } from "../botfunction";

let moveFunction: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]) => {
    switch(args[0]) {
        case "n":
        case "north":
            break;
        case "e":
        case "east":
            break;
        case "w":
        case "west":
            break;
        case "s":
        case "south":
            break;
    }
    return {success: true}
}

let dungeon = new Behavior(
    "dungeon", 
    ["dungeon", "d"], 
    "Explore a dungeon in discord!", 
    "!dungeon <function>", 
    () => {
        return {success: false, failReason: "Usage: !dungeon <function>"}
    }
);

let moveBehavior = new Behavior(
    "move",
    ["move", "m"],
    "Move in a direction",
    "move <direction>",
    moveFunction
)