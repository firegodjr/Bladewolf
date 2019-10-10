import { Message, TextChannel, DMChannel, GroupDMChannel } from "discord.js";
import { BotFunction } from "../functions/botfunction";
import { PersistentDataStore } from "./persistence";
import { Dictionary, WriteFile, ReadFile, Speak } from "../util";

var Discord = require('discord.js');
var fs = require('fs');

class BotState {
    private _client: any;
    private _behaviorKeywordMap: Dictionary<number> = {}
    private _botFunctions: BotFunction[] = []
    private _data: PersistentDataStore = new PersistentDataStore();
    private readonly _DATA_STORE_FILE = "Data/botData.json";

    constructor() {
        if(!ReadFile(this._DATA_STORE_FILE)) {
            WriteFile(this._DATA_STORE_FILE, "{}");
        }

        this._data.LoadValuesFromFile(this._DATA_STORE_FILE);
    }

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
            this._client = new Discord.Client();
        }
        return this._client;
    }

    public RegisterFunctionBehavior(func: BotFunction): void {
        this._botFunctions.push(func)

        func.keys.forEach((key) => {
            this._behaviorKeywordMap[key] = this._botFunctions.length - 1
        });
    }

    public GetRegisteredFunctions(): BotFunction[] {
        return this._botFunctions;
    }

    public GetFunctionByKey(key: string): BotFunction {
        return this._botFunctions[this._behaviorKeywordMap[key]];
    }

    public ClearFunctions(): void {
        this._behaviorKeywordMap = {}
        this._botFunctions = []
    }

    public ExecuteBehavior(key: string, message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): boolean {
        if(Object.keys(this._behaviorKeywordMap).includes(key))
        {
            console.log("Attempting to execute behavior for key " + key)
            let result = this.GetFunctionByKey(key).behavior(message, channel, args);
            console.log(result);
            if(!result.success) {
                Speak(channel, "Command failed: " + key);
                if(result.failReason) {
                    Speak(channel, "Reason: " + result.failReason);
                }
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