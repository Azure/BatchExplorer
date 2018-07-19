import * as createxliff from "xliff/createxliff";
import * as xliff2js from "xliff/xliff2js";

export class XliffUtils {
    /**
     * @param translations Key value object containing the translations
     */
    public static encode(translations: StringMap<string>): Promise<string> {
        return new Promise((resolve, reject) => {
            createxliff(
                "en-US",
                "en-US",
                translations,
                translations,
                "batch",
                (err, response) => {
                    if (err) { reject(err); return; }
                    resolve(response);
                });
        });
    }

    public static decode(xliff: string): Promise<StringMap<string>> {
        return new Promise((resolve, reject) => {
            xliff2js(xliff, (err, response) => {
                if (err) { reject(err); return; }
                resolve(response);
            });
        });
    }
}
