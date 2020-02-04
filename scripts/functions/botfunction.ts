import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { PermLevel } from "../state/permmgr";

/**
 * Represents a keyword function that this bot can handle
 */
export interface BotFunctionMeta {
    id: string,
    keys: string[],
    behavior: BotFunction,
    description?: string,
    usage?: string,
    hidden?: boolean,
    permLevel?: PermLevel
}

export interface BotFunctionResult {
    success: boolean,
    failReason?: string
}

export interface BotFunction {
    (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult;
}