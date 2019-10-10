import { Dictionary, ReadFile, WriteFile } from "../util";
import { resolve } from "path";

// Filesystem access
var fs = require('fs');

export class PersistentDataStore {
    private _data: Dictionary<any> = {}

    public GetValue(key: string) {
        return this._data[key];
    }

    public SetValue(key: string, value: any) {
        this._data[key] = value;
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
}