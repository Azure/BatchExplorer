// tslint:disable:no-console
import "../../src/client/init";

import * as fs from "fs";
import * as globNode from "glob";
import * as path from "path";
import { promisify } from "util";
import { XliffSerializer } from "../../src/@batch-flask/compiler";
import { loadDevTranslations } from "./load-dev-translations";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const glob = promisify(globNode);

async function digestXliffTranslations(file: string) {
    const content = await readFile(file);
    const result = await XliffSerializer.decode(content.toString());
    const json = JSON.stringify(result.translations, Object.keys(result.translations).sort(), 2);
    const dest = `./i18n/resources.${result.targetLanguage}.json`;
    await writeFile(dest, json);
    console.log(`Parsed xliff file ${file} and wrote json translations into ${dest}`);
}

async function run() {
    const files = await glob("./i18n/xliffs/*.xlf", {
        ignore: "./i18n/xliffs/*.en.xlf",
    });
    console.log(`Found ${files.length} xliff files. Processing and compiling json translations`);
    for (const file of files) {
        await digestXliffTranslations(file);
    }
    console.log(`Done compiling json translations`);
}

run().then(() => {
    process.exit(0);
});
