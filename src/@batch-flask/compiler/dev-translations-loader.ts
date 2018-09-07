import * as fs from "fs";
import * as globF from "glob";
import * as jsyaml from "js-yaml";
import * as util from "util";

const glob = util.promisify(globF);
const readFile = util.promisify(fs.readFile);

type DuplicateCallback = (key: string, source: string) => void;

export class DevTranslationsLoader {
    public translationFiles: string[];
    public translations = new Map<string, string>();

    public async load(duplicateCallback: DuplicateCallback): Promise<Map<string, string>> {
        this.translations.clear();
        if (!this.translationFiles) {
            this.translationFiles = await glob("**/*.i18n.yml", {
                ignore: "node_modules/**/*",
            });
        }
        await this._processFiles(this.translationFiles, duplicateCallback);
        return this.translations;
    }

    private async _processFiles(files: string[], duplicateCallback) {
        return Promise.all(files.map(x => this._readTranslationFile(x, duplicateCallback)));
    }

    private async _readTranslationFile(path: string, duplicateCallback) {
        const content = await readFile(path);
        this._mergeTranslations(this._flatten(jsyaml.load(content.toString())), path, duplicateCallback);
    }

    private _flatten(translations: StringMap<any>): StringMap<string> {
        const output = {};

        function step(object, prev = null, currentDepth = 0) {
            currentDepth = currentDepth || 1;
            for (const key of Object.keys(object)) {
                const value = object[key];
                const isString = typeof value === "string";

                const newKey = prev
                    ? prev + "." + key
                    : key;

                if (!isString && Object.keys(value).length) {
                    output[newKey] = step(value, newKey, currentDepth + 1);
                } else {
                    output[newKey] = value;
                }
            }
        }

        step(translations);

        return output;
    }

    private _mergeTranslations(translations: StringMap<any>, source: string, duplicateCallback: DuplicateCallback) {
        if (process.env.NODE_ENV !== "production") {
            for (const key of Object.keys(translations)) {
                if (this.translations.has(key)) {
                    duplicateCallback(key, source);
                }
            }
        }

        for (const key of Object.keys(translations)) {
            this.translations.set(key, translations[key]);
        }
    }
}
