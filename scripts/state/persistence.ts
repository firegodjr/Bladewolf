import { Dictionary, ReadFile, WriteFile } from "../util/util";
import { resolve } from "path";
import { PermLevel } from "./permmgr";
import { Guild, GuildMember, User } from "discord.js";
import { userInfo } from "os";

// Filesystem access
var fs = require('fs');

const GUILD_DATA_PREFIX = "guild";

export class PersistentDataStore {
    private _data: Dictionary<any> = {}

    public GetGlobalValue(key: string): any {
        return this._data[key];
    }

    public SetGlobalValue(key: string, value: any) {
        this._data[key] = value;
        console.log("Writing '" + value + "' to '" + key + "'");
    }

    public InitGuild(guild: Guild): GuildMeta {
        let guildKey = this._getGuildKey(guild);
        if(!this._data[guildKey]) {
            console.log("Creating new persistent entry for guild " + guildKey)
            this._data[guildKey] = {
                userData: {},
                data: {}
            };
        }

        return this._data[guildKey];
    }

    public GetGuildValue(guild: Guild, key: string): any {
        let guildData = this.InitGuild(guild);
        return guildData.data[key];
    }

    public SetGuildValue(guild: Guild, key: string, value: any) {
        let guildData = this.InitGuild(guild);
        guildData.data[key] = value;
    }

    public InitGuildMember(member: GuildMember): UserMeta {
        let guildData = this.InitGuild(member.guild);

        if(!guildData.data[member.user.id]) {
            console.log("Creating new persistent entry for guild member " + member.user.id)
            guildData.data[member.user.id] = {
                permLevel: PermLevel.USER,
                data: {}
            };
        }

        return guildData.data[member.user.id];
    }

    public GetGuildMemberValue(member: GuildMember, key: string): any {
        let guildData = this._data[this._getGuildKey(member.guild)] as GuildMeta;
        let userData = guildData.userData[member.user.id] as UserMeta;
        return userData.data[key];

    }

    public SetGuildMemberValue(member: GuildMember, key: string, value: any) {
        let guildData = this._data[this._getGuildKey(member.guild)] as GuildMeta;
        let userData = guildData.userData[member.user.id] as UserMeta;
        userData.data[key] = value;
    }

    public InitUser(user: User): UserMeta {
        if(!this._data[user.id]) {
            console.log("Creating new persistent entry for user " + user.id)
            this._data[user.id] = { data: {} };
        }

        return this._data[user.id];
    }

    public GetUserValue(user: User, key: string): any {
        let userData = this.InitUser(user);
        return userData.data[key];
    }

    public SetUserValue(user: User, key: string, value: any) {
        let userData = this.InitUser(user);
        userData.data[key] = value;
    }

    public SaveValuesToFile(path: string) {
        WriteFile(path, JSON.stringify(this._data));
    }

    public LoadValuesFromFile(path: string) {
        let data = ReadFile(path);
        if(data)
        {
            this._data = JSON.parse(data);
            console.log("Persistent data loaded from '" + resolve(path) + "'.");
        }
        else
        {
            console.log("Cannot load data from '" + resolve(path) + "'. Does the file exist?");
        }
    }

    private _getGuildKey(guild: Guild) {
        return GUILD_DATA_PREFIX + guild.id;
    }
}

export interface GuildMeta {
    userData: Dictionary<UserMeta>,
    data: Dictionary<any>
}

export interface UserMeta {
    permLevel: PermLevel,
    data: Dictionary<any>
}