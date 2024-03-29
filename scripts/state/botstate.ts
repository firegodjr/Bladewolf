import { Message, TextChannel, DMChannel, GroupDMChannel, Guild } from "discord.js";
import { BotFunctionMeta } from "../functions/botfunction";
import { PersistentDataStore } from "./persistence";
import { Dictionary, WriteFile, ReadFile, Speak } from "../util/util";
import { PermManager, PermLevel } from "./permmgr";

var Discord = require('discord.js');
var fs = require('fs');

export interface IBotManifest {
    prefix?: string,
    game?: string
}

/**
 * Singleton module that handles all state-related functionality
 */
class BotState {
    private _client: any;
    private _behaviorKeywordMap: Dictionary<number> = {}
    private _botFunctions: BotFunctionMeta[] = []
    private _data: PersistentDataStore = new PersistentDataStore();
    private readonly _DATA_STORE_FILE = "./Data/botData.json";
    public readonly MANIFEST_FILE = "./scripts/functions/manifest.json";
    public readonly LOGS_DIR = "/logs/"

    public readonly COMMAND_PREFIX = "!";

    constructor() {
        if(!ReadFile(this._DATA_STORE_FILE)) {
            WriteFile(this._DATA_STORE_FILE, "{}");
        }

        this._data.LoadValuesFromFile(this._DATA_STORE_FILE);
    }

    /**
     * Saves all data to the predefined default botData.json file
     */
    public SaveData(): void {
        if(this._data) {
            this._data.SaveValuesToFile(this._DATA_STORE_FILE)
        }
    }

    public GetDataStore(): PersistentDataStore {
        return this._data;
    }
    
    public GetClient(): any {
        if(!this._client) {
            this._client = new Discord.Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"] });
        }
        return this._client;
    }

    public RegisterFunctionBehavior(func: BotFunctionMeta): void {
        this._botFunctions.push(func)

        func.keys.forEach((key) => {
            this._behaviorKeywordMap[key] = this._botFunctions.length - 1
        });
    }

    public GetRegisteredFunctions(): BotFunctionMeta[] {
        return this._botFunctions;
    }

    public GetFunctionByKey(key: string): BotFunctionMeta {
        return this._botFunctions[this._behaviorKeywordMap[key]];
    }

    public ClearFunctions(): void {
        this._behaviorKeywordMap = {}
        this._botFunctions = []
    }

    /**
     * Executes a dynamically-loaded command, if allowed by user permissions
     * @param key Command provided by user
     * @param message Message containing the command
     * @param channel The channel containing the command
     * @param args Arguments after the command
     * @returns True if this command was correctly handled
     */
    public ExecuteBehavior(key: string, message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): boolean {
        console.log("ExecuteBehavior()")
        if(Object.keys(this._behaviorKeywordMap).includes(key)) {
            console.log("Attempting to execute behavior for key " + key)
            if(true /*PermManager.GetUserHasPermissionToCallFunction(channel, message.author, key)*/) {
                console.log("User has permission.")
                let func = this.GetFunctionByKey(key);
                if(func) {
                    let result = func.behavior(message, channel, args);
                    console.log(result);
                    if(!result.success) {
                        Speak(channel, "Command failed: " + key);
                        if(result.failReason) {
                            Speak(channel, "Reason: " + result.failReason + (func.usage ? "\nUsage: " + func.usage : ""));
                        }
                    }
                }
            }
            else {
                Speak(channel, "You do not have permission to perform this command.");
            }
            return true;
        }
        else
        {
            return false;
        }
    }
}

export var State = new BotState();