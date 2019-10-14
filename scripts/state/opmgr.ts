import { State } from "./botstate"
import { User, TextChannel, DMChannel, GroupDMChannel, Guild, ChannelData } from "discord.js";
import { UserMeta, GuildMeta, PersistentDataStore } from "./persistence";
import { Dictionary, Speak } from "../util";

const PERM_KEY = "perms";

export enum PermLevel {
  BLOCKED,
  USER,
  TRUSTED,
  ADMIN,
  OP
}

export class OpManager {
  /**
   * Returns the permission level of the user
   */
  public static GetUserPermLevel(channel: TextChannel, user: User): PermLevel {
    if(!channel.guild || channel.guild.ownerID == user.id) return PermLevel.OP;

    let dataStore: PersistentDataStore = State.GetDataStore();
    const GUILD_KEY = PERM_KEY + channel.guild.id;

    if(!dataStore.GetValue(GUILD_KEY)) {
      dataStore.SetValue(GUILD_KEY, { userPermOverrides: {} });
      State.SaveData();
      Speak(channel, "No existing user metadata for this server found. Creating data...");
    }
    
    let userPerms: Dictionary<UserMeta> = State.GetDataStore().GetValue(PERM_KEY + channel.guild.id).userPermOverrides;
    let data: UserMeta = userPerms[user.id];
    
    if(data) {
      return data.permLevel;
    }
    else {
      return PermLevel.USER;
    }
  }

  /**
   * Sets a user perms with the referral of an existing admin or higher user
   * @param refUser 
   * @param newOp 
   */
  public static SetUserPerms(channel: TextChannel, refUser: User, newOp: User, newPermLevel: PermLevel): boolean {
    let userLevel = this.GetUserPermLevel(channel, refUser);
    let changedUserLevel = this.GetUserPermLevel(channel, newOp)
    let dataStore: PersistentDataStore = State.GetDataStore();
    if(userLevel >= PermLevel.ADMIN && userLevel > changedUserLevel) {
      const GUILD_KEY = PERM_KEY + channel.guild.id;

      if(!dataStore.GetValue(GUILD_KEY)) {
        dataStore.SetValue(GUILD_KEY, { userPermOverrides: {} });
        Speak(channel, "No existing user metadata for this server found. Creating data...");
      }
      
      let guildData = dataStore.GetValue(GUILD_KEY) as GuildMeta;
      let userPerms: Dictionary<UserMeta> = guildData.userPermOverrides;
      let user: UserMeta = userPerms[newOp.id];

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
}

