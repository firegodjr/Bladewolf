import { State } from "./botstate"
import { User, TextChannel, DMChannel, GroupDMChannel, Guild } from "discord.js";
import { UserMeta } from "./persistence";
import { Dictionary } from "../util";

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
  public static SetUserPerms(channel: TextChannel, refUser: User, newOp: User, newPermLevel: PermLevel) {
    if(this.GetUserPermLevel(channel, refUser) >= PermLevel.ADMIN) {
      let userPerms: Dictionary<UserMeta> = State.GetDataStore().GetValue(PERM_KEY + channel.guild.id).userPermOverrides;
      let user: UserMeta = userPerms[newOp.id];

      if(!user) {
        user = {
          permLevel: newPermLevel
        };
      }
      else {
        user.permLevel = newPermLevel;
      }
    }

    State.SaveData();
  }
}

