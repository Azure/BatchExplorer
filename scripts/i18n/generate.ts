// tslint:disable:no-console
import "../../src/client/init";

import * as fs from "fs";
import { promisify } from "util";
import { DevTranslationsLoader } from "../../src/@batch-flask/compiler";

const writeFile = promisify(fs.writeFile);

async function createEnglishTranslations() {
    const loader = new DevTranslationsLoader();
    console.log("Loading dev translations");
    let hasDuplicate = false;
    const translations = await loader.load((key, file) => {
        console.warn(`${key} is being duplicated. "${file}"`);
        hasDuplicate = true;
    });
    console.log(`Loaded dev translations (${translations.size})`);
    if (hasDuplicate) {
        process.exit(1);
    }

    const map = Array.from(translations).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});

    const content = JSON.stringify(map);

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
