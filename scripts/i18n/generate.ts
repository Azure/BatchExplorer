// tslint:disable:no-console
import "../../src/client/init";

import * as fs from "fs";
import { promisify } from "util";
import { loadDevTranslations } from "./load-dev-translations";

const writeFile = promisify(fs.writeFile);

async function createEnglishTranslations() {
    const translations = await loadDevTranslations();
    const content = JSON.stringify(translations, null, 2);

    const dest = "./i18n/resources.en.json";
    await writeFile(dest, content);
    console.log(`Saved combined english translations (${translations.size}) to ${dest}`);
}

async function run() {
    await createEnglishTranslations();
}

run().then(() => {
    process.exit(0);
});
