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

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export async function mergeAllTranslations(outputPath: string) {
    const currentDirectory = process.cwd();
    const rootDir = path.resolve(currentDirectory, "..");

    // Ensure the output directory exists
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    // Define resource directories (absolute paths)
    const resourceDirs = [
        path.join(rootDir, "packages/common/resources/i18n/json"),
        path.join(rootDir, "packages/playground/resources/i18n/json"),
        path.join(rootDir, "packages/react/resources/i18n/json"),
        path.join(rootDir, "packages/service/resources/i18n/json"),
    ];

    // Build the English file for each package before building web/desktop translations (it is a prerequisite)

    const buildPackageEnglishPromises = [];

    buildPackageEnglishPromises.push(
        createEnglishTranslations(
            path.join(rootDir, "packages/react/src/ui-react"),
            path.join(rootDir, "packages/react/i18n"),
            path.join(rootDir, "packages/react/resources/i18n/json"),
            "lib.react"
        )
    );
    buildPackageEnglishPromises.push(
        createEnglishTranslations(
            path.join(rootDir, "packages/playground/src/ui-playground"),
            path.join(rootDir, "packages/playground/i18n"),
            path.join(rootDir, "packages/playground/resources/i18n/json"),
            "lib.playground"
        )
    );
    buildPackageEnglishPromises.push(
        createEnglishTranslations(
            path.join(rootDir, "packages/common/src/ui-common"),
            path.join(rootDir, "packages/common/i18n"),
            path.join(rootDir, "packages/common/resources/i18n/json"),
            "lib.common"
        )
    );
    buildPackageEnglishPromises.push(
        createEnglishTranslations(
            path.join(rootDir, "packages/service/src/ui-service"),
            path.join(rootDir, "packages/service/i18n"),
            path.join(rootDir, "packages/service/resources/i18n/json"),
            "lib.service"
        )
    );

    await Promise.all(buildPackageEnglishPromises);

    // Initialize an empty object to store the merged translations
    const mergedTranslations: Record<string, Record<string, string>> = {};

    // Iterate through each resource directory
    for (const dir of resourceDirs) {
        // Iterate through each JSON file in the directory
        for (const file of fs.readdirSync(dir)) {
            if (file.startsWith("resources.") && file.endsWith(".json")) {
                const langID = file.split(".")[1];

                // If the language ID is not in the object, add it
                if (!mergedTranslations[langID]) {
                    mergedTranslations[langID] = {};
                }

                // Read the JSON content and parse it
                const content = JSON.parse(
                    await readFileAsync(path.join(dir, file), "utf-8")
                );

                // Merge the content into the object
                Object.assign(mergedTranslations[langID], content);
            }
        }
    }

    // Write the merged translations to the output directory
    for (const langID of Object.keys(mergedTranslations)) {
        const outputFile = path.join(outputPath, `resources.${langID}.json`);

        // Read existing translations in the output file if it exists
        let existingTranslations = {};
        if (fs.existsSync(outputFile)) {
            existingTranslations = JSON.parse(
                await readFileAsync(outputFile, "utf-8")
            );
        }

        // Merge existing translations with new translations
        const combinedTranslations = {
            ...existingTranslations,
            ...mergedTranslations[langID],
        };

        // Sort keys alphabetically
        const sortedTranslations = Object.fromEntries(
            Object.entries(combinedTranslations).sort()
        );

        // Write the sorted translations to the output file
        await writeFileAsync(
            outputFile,
            JSON.stringify(sortedTranslations, null, 2),
            "utf-8"
        );
    }

    console.log(`Merged translations have been saved in ${outputPath}`);
}

// Helper function that generates the TypeScript interface from the JSON content
function generateTypeScriptInterface(
    cleanedContent: Record<string, unknown>
): string {
    let tsContent = "export interface GeneratedResourceStrings {\n";

    for (const key in cleanedContent) {
        tsContent += `    "${key}": string;\n`;
    }

    tsContent += "}\n";
    return tsContent;
}

// Function to generate English file for a package from its YAML files
export async function createEnglishTranslations(
    sourcePath: string,
    destPath: string,
    outputPath: string,
    packageName?: string
) {
    const translations = await loadDevTranslations(sourcePath, packageName);
    const content = JSON.stringify(translations, null, 2).replace(/\n/g, EOL);

    const resJsonPath = path.join(destPath, "resources.resjson");
    await writeFile(resJsonPath, content);
    console.log(
        `Saved combined english translations to RESJSON file ${resJsonPath}`
    );

    // Create JSON English file by parsing the RESJSON file and removing RESJSON-specific syntax and formatting
    const resJsonContent = fs.readFileSync(resJsonPath, "utf-8");

    const strippedResJsonContent = resJsonContent
        .replace(/\/\/.*$/gm, "") // remove line comments
        .replace(/\/\*[\s\S]*?\*\//gm, "") // remove block comments
        .replace(/,\s*}/gm, "}") // remove trailing commas in objects
        .replace(/,\s*]/gm, "]"); // remove trailing commas in arrays

    const parsedContent = JSON.parse(strippedResJsonContent);
    const cleanContent: Record<string, unknown> = {};

    // Iterate through the properties of the object and exclude properties with names starting with an underscore
    for (const key in parsedContent) {
        if (
            Object.hasOwnProperty.call(parsedContent, key) &&
            !key.startsWith("_")
        ) {
            cleanContent[key] = parsedContent[key];
        }
    }

    const cleanedJsonContent = JSON.stringify(cleanContent, null, 2);
    const resourcesJsonPath = path.join(outputPath, "resources.en.json");

    // Check if the directory exists and create it if it doesn't
    if (!fs.existsSync(path.dirname(resourcesJsonPath))) {
        fs.mkdirSync(path.dirname(resourcesJsonPath), { recursive: true });
    }

    // Write the cleaned content to the file
    fs.writeFileSync(resourcesJsonPath, cleanedJsonContent);

    console.log(
        `Saved stripped english translations to JSON file ${resourcesJsonPath}`
    );

    // Generate and save the TypeScript interface
    const tsContent = generateTypeScriptInterface(cleanContent);
    const resourcesTsPath = path.join(
        sourcePath,
        "localization/generated/resources.ts"
    );

    if (!fs.existsSync(path.dirname(resourcesTsPath))) {
        fs.mkdirSync(path.dirname(resourcesTsPath), { recursive: true });
    }

    fs.writeFileSync(resourcesTsPath, tsContent);

    console.log(`Saved generated TypeScript interface to ${resourcesTsPath}`);
}

//load-dev-translations.ts
export async function loadDevTranslations(
    sourcePath: string,
    packageName?: string
): Promise<{ [key: string]: string }> {
    const loader = new DevTranslationsLoader();
    let hasDuplicate = false;
    const translations = await loader.load(sourcePath, (key, file) => {
        console.warn(`${key} is being duplicated. "${file}"`);
        hasDuplicate = true;
    });
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
