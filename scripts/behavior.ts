import { BotFunction, BotFunctionResult, BotFunctionMeta } from "./functions/botfunction"
import { GroupDMChannel, Message, TextChannel, DMChannel } from "discord.js"
import { Dictionary } from "./util"
import { PermLevel } from "./state/permmgr"

export class Behavior {
    public name = ""
    public aliases: string[] = []
    public description = ""
    public usage = ""
    public permLevel = PermLevel.USER

    private _subBehaviors: Dictionary<Behavior> = {}
    private _function: BotFunction = (message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]) => { 
        console.log("No function assigned to behavior " + this.name); return {success: true}
    }

    constructor(name: string, aliases: string[], description: string, usage: string, func: BotFunction) {
        this.name = name;
        this.aliases = aliases;
        this.description = description;
        this.usage = usage;
        this._function = func;
    }

    public run(message: Message, channel: TextChannel | DMChannel | GroupDMChannel, args: string[]): BotFunctionResult {
        if(this._subBehaviors[args[0]]) {
            return this._subBehaviors[args[0]].run(message, channel, args.slice(1))
        }
        else {
            return this._function(message, channel, args)
        }
    }

    public addSubBehavior(sb: Behavior) {
        this._subBehaviors[sb.name] = sb
    }

    public addSubBehaviors(behaviors: Behavior[]) {
        behaviors.forEach(behavior => {
            this.addSubBehavior(behavior);
        });
    }

    public toBotFunctionMeta(): BotFunctionMeta {
        return {
            id: this.name,
            keys: this.aliases,
            behavior: this.run,
            description: this.description,
            usage: this.usage,
            permLevel: this.permLevel
        }
    }
}