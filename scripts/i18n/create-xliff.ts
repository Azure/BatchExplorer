// tslint:disable:no-console
import "../../src/client/init";

import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { promisify } from "util";
import { XliffSerializer } from "../../src/@batch-flask/compiler";
import { loadDevTranslations } from "./load-dev-translations";

const ensureDir = promisify(mkdirp);
const writeFile = promisify(fs.writeFile);

async function createXliffTranslations() {
    const translations = await loadDevTranslations();
    const xliff = XliffSerializer.encode(translations);
    const dest = "./i18n/xliff/resources.en.xlf";
    await ensureDir(path.dirname(dest));
    await writeFile(dest, xliff);
    console.log(`Saved compiled xliff to ${dest}`);
}

async function run() {
    await createXliffTranslations();
}

run().then(() => {
    process.exit(0);
});
