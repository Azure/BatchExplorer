import { promisify } from "util";
import * as xml2js from "xml2js";

const parseString: any = promisify(xml2js.parseString);

/* eslint-disable max-len */
const rootAttributes = {
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd",
    "xmlns": "urn:oasis:names:tc:xliff:document:1.2",
    "version": "1.2",
};
/* eslint-enable max-len */

export interface XLiffDecodeResult {
    translations: StringMap<string>;
    targetLanguage: string;
}

export class XliffSerializer {
    /**
     * @param translations Key value object containing the translations
     */
    public static encode(translations: StringMap<string>): string {
        const units: any[] = [];

        const fileAttributes = {
            "original": "Batch",
            "datatype": "plaintext",
            "source-language": "en",
        };

        const root = {
            $: rootAttributes,
            file: {
                $: fileAttributes,
                body: {
                    "trans-unit": units,
                },
            },
        };

        const keys = Object.keys(translations).sort();

        for (const key of keys) {
            units.push({
                $: { id: key },
                source: translations[key],
            });
        }
        const builder = new xml2js.Builder({
            headless: true,
        });
        return builder.buildObject({
            xliff: root,
        });
    }

    public static async decode(xliff: string): Promise<XLiffDecodeResult> {
        const xml = await parseString(xliff);
        const file = xml.xliff.file[0];
        const targetLanguage = file["$"]["target-language"];

        const transUnits = file.body[0]["trans-unit"];
        const translations = {};
        for (const unit of transUnits) {
            if (!unit.target || unit.target.length === 0) { continue; }
            const target = unit.target[0];
            const translated = target.$.state === "translated";

            if (translated) {
                translations[unit.$.id] = target["_"];
            }
        }

        return {
            targetLanguage,
            translations,
        };
    }
}
