import { State } from "./botstate"
import { User, TextChannel, DMChannel, GroupDMChannel, Guild, ChannelData, Channel } from "discord.js";
import { UserMeta, GuildMeta, PersistentDataStore } from "./persistence";
import { Dictionary, Speak } from "../util";
import { BotFunction } from "../functions/botfunction";

const PERM_KEY = "guild";

export enum PermLevel {
  BLOCKED,
  USER,
  TRUSTED,
  ADMIN,
  OP
}

export enum Priveliges {
  MANAGE_FUNCTIONS,
  MANAGE_USERS
}

export class PermManager {
  /**
   * Returns the permission level of the user
   */
  public static GetUserPermLevel(guild: Guild, user: User): PermLevel {
    let dataStore: PersistentDataStore = State.GetDataStore();
    const GUILD_KEY = PERM_KEY + guild.id;

    if(!dataStore.GetGlobalValue(GUILD_KEY)) {
      dataStore.SetGlobalValue(GUILD_KEY, { userPermOverrides: {} });
      State.SaveData();
    }
    
    let userPerms: Dictionary<UserMeta> = State.GetDataStore().GetGlobalValue(PERM_KEY + guild.id).userPermOverrides;
    let data: UserMeta = userPerms[user.id];
    
    if(data) {
      return data.permLevel;
    }
    else {
      return PermLevel.USER;
    }
  }

  public static GetUserPermLevelFromChannel(channel: TextChannel, user: User): PermLevel {
    if(!channel.guild || channel.guild.ownerID == user.id) return PermLevel.OP;
    return this.GetUserPermLevel(channel.guild, user);
  }

  /**
   * Sets a user perms with the referral of an existing admin or higher user
   * @param refUser 
   * @param newOp 
   */
  public static SetUserPerms(channel: TextChannel, refUser: User, newOp: User, newPermLevel: PermLevel): boolean {
    let userLevel = this.GetUserPermLevelFromChannel(channel, refUser);
    let changedUserLevel = this.GetUserPermLevelFromChannel(channel, newOp)
    let dataStore: PersistentDataStore = State.GetDataStore();
    if(userLevel >= PermLevel.ADMIN && userLevel > changedUserLevel) {
      const GUILD_KEY = PERM_KEY + channel.guild.id;

      if(!dataStore.GetGlobalValue(GUILD_KEY)) {
        dataStore.SetGlobalValue(GUILD_KEY, { userPermOverrides: {} });
        Speak(channel, "No existing user metadata for this server found. Creating data...");
      }
      
      let guildData = dataStore.GetGlobalValue(GUILD_KEY) as GuildMeta;
      let userData: Dictionary<UserMeta> = guildData.userData;
      let user: UserMeta = userData[newOp.id];

      if(!user) {
        user = {
          permLevel: newPermLevel,
          data: {}
        };
      }
      else {
        user.permLevel = newPermLevel;
      }
    }
    else {
      return false;
    }

    State.SaveData();
    return true;
  }

  public static GetFunctionPermLevel(guild: Guild, key: string): PermLevel {
    let func: BotFunction = State.GetFunctionByKey(key);
    let funcPermLevel = State.GetDataStore().GetGuildValue(guild, func.id);
    if(funcPermLevel) {
      return funcPermLevel;
    }
    else if(func.permLevel) {
      return func.permLevel;
    }
    else return PermLevel.USER;
  }

  /**
   * Sets the required perm level to run this command on a per-guild basis
   * @param guild 
   * @param refUser 
   * @param key 
   * @param newPermLevel 
   */
  public static SetFunctionPermLevel(guild: Guild, refUser: User, key: string, newPermLevel: PermLevel): boolean {
    let func = State.GetFunctionByKey(key);
    if(this.GetUserPermLevel(guild, refUser) < this.GetFunctionPermLevel(guild, key)) {
      return false; 
    }
    else {
      let dataStore = State.GetDataStore()
      dataStore.SetGuildValue(guild, func.id, newPermLevel);
      return true;
    }
  }

  public static GetUserHasPermissionToCallFunction(channel: Channel, user: User, key: string): boolean {
    if(!(channel as TextChannel).guild) {
      return true;
    }
    let guild = (channel as TextChannel).guild;
    let userPermLevel = this.GetUserPermLevel(guild, user);
    let funcPermLevel = this.GetFunctionPermLevel(guild, key);
    return userPermLevel >= funcPermLevel;
  }
}

