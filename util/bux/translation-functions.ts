/* eslint-disable no-console */

import * as fs from "fs";
import { EOL } from "os";
import { promisify } from "util";
import { glob as globF } from "glob";
import * as jsyaml from "js-yaml";
import * as util from "util";
import * as path from "path";

type StringMap<V> = { [key: string]: V };
type NestedStringMap<V> = StringMap<V> | StringMap<StringMap<V>>;

const writeFile = promisify(fs.writeFile);

export async function createEnglishTranslations(
    sourcePath: string,
    destJSONPath: string,
    destRESJSONPath: string,
    packageName?: string
) {
    const translations = await loadDevTranslations(sourcePath, packageName);
    const content = JSON.stringify(translations, null, 2).replace(/\n/g, EOL);

    const jsonPath = path.join(destJSONPath, "resources.json");
    await writeFile(jsonPath, content);
    console.log(`Saved combined english translations to JSON file ${jsonPath}`);

    const resJsonPath = path.join(destRESJSONPath, "resources.resjson");
    await writeFile(resJsonPath, content);
    console.log(
        `Saved combined english translations to RESJSON file ${resJsonPath}`
    );
}

//load-dev-translations.ts
export async function loadDevTranslations(
    sourcePath: string,
    packageName?: string
): Promise<{ [key: string]: string }> {
    const loader = new DevTranslationsLoader();
    console.log("Loading dev translations...");
    let hasDuplicate = false;
    const translations = await loader.load(sourcePath, (key, file) => {
        console.warn(`${key} is being duplicated. "${file}"`);
        hasDuplicate = true;
    });
    console.log(`Loaded dev translations`);
    if (hasDuplicate) {
        throw new Error();
    }

    return Array.from(translations).reduce(
        (obj: Record<string, string>, [key, value]) => {
            if (packageName) {
                obj[packageName + "." + key] = value;
            } else {
                obj[key] = value;
            }

            // Sort the entries by key in alphabetical order
            const sortedObj: { [key: string]: string } = {};
            Object.keys(obj)
                .sort()
                .forEach((key) => (sortedObj[key] = obj[key]));
            return sortedObj;
        },
        {}
    );
}

//dev-translations-loader.ts

const glob = util.promisify(globF);
const readFile = util.promisify(fs.readFile);

type DuplicateCallback = (key: string, source: string) => void;

export class DevTranslationsLoader {
    public translationFiles!: string[];
    public translations = new Map<string, string>();

    public async load(
        sourcePath: string,
        duplicateCallback: DuplicateCallback
    ): Promise<Map<string, string>> {
        this.translations.clear();
        if (!this.translationFiles) {
            const resolvedSourcePath = path.resolve(sourcePath);
            this.translationFiles = await glob(
                `${resolvedSourcePath}/**/*.i18n.yml`,
                {
                    ignore: "node_modules/**/*",
                }
            );
        }

        await this._processFiles(this.translationFiles, duplicateCallback);
        return this.translations;
    }

    private async _processFiles(
        files: string[],
        duplicateCallback: DuplicateCallback
    ) {
        return Promise.all(
            files.map((x) => this._readTranslationFile(x, duplicateCallback))
        );
    }

    private async _readTranslationFile(
        path: string,
        duplicateCallback: DuplicateCallback
    ) {
        const content = await readFile(path);
        this._mergeTranslations(
            this._flatten(
                jsyaml.load(content.toString()) as NestedStringMap<string>
            ),
            path,
            duplicateCallback
        );
    }

    private _flatten(translations: NestedStringMap<string>): StringMap<string> {
        const output: StringMap<string> = {};

        function step(
            object: NestedStringMap<string>,
            prev: string | null = null,
            currentDepth: number = 0
        ) {
            currentDepth = currentDepth || 1;
            for (const key of Object.keys(object)) {
                const newKey = prev ? prev + "." + key : key;
                const value = object[key];
                if (typeof value === "string") {
                    output[newKey] = value;
                } else if (value instanceof Object) {
                    if (Object.keys(value).length > 0) {
                        step(value, newKey, currentDepth + 1);
                    }
                } else {
                    throw new Error(`Invalid translation value for ${newKey}`);
                }
            }
        }

        step(translations);

        return output;
    }

    private _mergeTranslations(
        translations: StringMap<string>,
        source: string,
        duplicateCallback: DuplicateCallback
    ) {
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
