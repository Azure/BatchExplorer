import * as xml2js from "xml2js";

// tslint:disable:max-line-length
const rootAttributes = {
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": "urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd",
    "xmlns": "urn:oasis:names:tc:xliff:document:1.2",
    "version": "1.2",
};
// tslint:enable:max-line-length

export class XliffSerializer {
    /**
     * @param translations Key value object containing the translations
     */
    public static encode(translations: StringMap<string>): string {
        const units = [];

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

        for (const key of Object.keys(translations)) {
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
}
