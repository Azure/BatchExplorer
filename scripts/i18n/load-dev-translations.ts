// tslint:disable:no-console
import { DevTranslationsLoader } from "../../src/@batch-flask/compiler";

export async function loadDevTranslations(): Promise<{ [key: string]: string }> {
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

    return Array.from(translations).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
}
