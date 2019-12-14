import { State } from "./botstate"
import { User, TextChannel, DMChannel, GroupDMChannel, Guild, ChannelData, Channel } from "discord.js";
import { UserMeta, GuildMeta, PersistentDataStore } from "./persistence";
import { Dictionary, Speak } from "../util";
import { BotFunctionMeta } from "../functions/botfunction";

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
    let data: UserMeta = State.GetDataStore().InitGuildMember(guild.member(user));
    
    if(guild.owner.user.id == user.id) {
      console.log("This user is the owner, returning OP");
      return PermLevel.OP;
    }
    
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
    if(userLevel > changedUserLevel && userLevel > newPermLevel) {
      let user = State.GetDataStore().InitGuildMember(channel.guild.member(newOp));
      user.permLevel = newPermLevel;
    }
    else {
      return false;
    }

    State.SaveData();
    return true;
  }

  public static GetFunctionPermLevel(guild: Guild, key: string): PermLevel {
    let func: BotFunctionMeta = State.GetFunctionByKey(key);
    if(func) {
      let funcPermLevel = State.GetDataStore().GetGuildValue(guild, func.id);
      if(funcPermLevel) {
        return funcPermLevel;
      }
      else if(func.permLevel) {
        return func.permLevel;
      }
      else return PermLevel.USER;
    }
    else {
      return PermLevel.BLOCKED;
    }
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
    let userPerm = this.GetUserPermLevel(guild, refUser);
    if(userPerm < this.GetFunctionPermLevel(guild, key) || userPerm < newPermLevel) {
      console.log("User is not allowed to change command perms.");
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

