import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PermLevel } from "../state/permmgr";

/**
 * Represents a keyword function that this bot can handle
 */
export interface BotFunction {
    id: string,
    keys: string[],
    behavior: BotFunctionBehavior,
    description?: string,
    usage?: string,
    hidden?: boolean,
    permLevel?: PermLevel
}

export interface BehaviorResult {
    success: boolean,
    failReason?: string
}

export interface BotFunctionBehavior {
    (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BehaviorResult;
}