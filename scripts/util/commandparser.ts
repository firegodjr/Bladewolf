import { Client, Message, User } from "discord.js";
import { State } from "../state/botstate";
import { Speak, LoadBotFunctions, RegisterBotFunctions, WriteFile } from "./util";
import { resolve } from "path";

export class Argument {
  raw: string;
  mention: User;

  public constructor(raw: string, mention: User) {
    this.raw = raw;
    this.mention = mention;
  }
  
  public AsInt(): number {
    return parseInt(this.raw);
  }

  public AsNum(): number {
    return parseFloat(this.raw);
  }

  public AsBool(): boolean {
    let rawUpper = this.raw.toUpperCase()
    return rawUpper == "TRUE" || rawUpper == "1";
  }

  public AsUser(): User {
    return this.mention;
  }
}

export function ParseMessage(client: Client, message: Message) {
  let commandPrefix = State.COMMAND_PREFIX;
  if (message.content.startsWith(commandPrefix))
  {
      console.log("Message recieved: '" + message.content + "'");
      var fullCommand = message.content.slice(commandPrefix.length);
      var channel = message.channel;
      var args = fullCommand.split(' ');
      var cmd = args[0];
      var mention;

      try
      {
          if(!State.ExecuteBehavior(cmd.toLowerCase(), message, channel, args.slice(1))) {
              switch(cmd.toLowerCase()) {
                  case '$reloadfunctions':
                      Speak(channel, "Reloading functions in manifest...");
                      State.ClearFunctions()
                      let botFunctions = LoadBotFunctions();
                      RegisterBotFunctions(botFunctions);
                      Speak(channel, "...Done!");
                      break;

                  // Change the game that the bot is playing
                  case '$game':
                      if(args.length > 1)
                      {
                          var game = "";
                          for(var i = 1; i < args.length; ++i)
                          {
                              game += args[i] + " ";
                          }

                          client.user.setActivity(game.trim(), { type: "PLAYING" });
                          Speak(channel, "Game set to '" + game.trim() + "'");
                      }
                      break;

                  // Say something to the given channel
                  // case '$adminsay':
                  //     var adminsay = MergeArgsPast(args, 2);
                  //     Speak(client.channels.get(args[1]), adminsay);
                  //     Speak(channel, "Saying: '" + adminsay + "'");
                  //     break;
                  
                  // case '$supersay':
                  //     var supersay = MergeArgsPast(args, 2);
                  //     client.channels.get(args[1]).send(supersay);
                  //     break;

                  // Throw an error
                  case '$throw':
                      throw new Error("Test error. Hello!");
                      break;

                  // Unknown command
                  default:
                      if(!args[0].includes('!')) // If the command is just more '!'s, then it's probably Katie
                      {
                          Speak(channel, "I'm sorry, I'm not sure how to do that.");
                      }
                      break;
              }
          }
      } catch(error)
      {
          channel.send("`Error: " + error.message + "\nThis exception has been logged.`");
          var errorDate = new Date();
          var path = "./" + State.LOGS_DIR + errorDate.getMonth() + "-" + errorDate.getDay() + "-" + errorDate.getFullYear() + " " + errorDate.getHours() + errorDate.getMinutes() + ".txt";
          console.log("Logging to " + resolve(path));
          WriteFile(
              path,
              "Error: " + error.message + "\nStacktrace: " + error.stack
          );
      }
  }
}