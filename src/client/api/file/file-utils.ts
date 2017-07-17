import * as download from "download";
import * as extract from "extract-zip";
import * as path from "path";

/**
 * Helper method for file releated actions.
 * This should contains action where you use stream or large file
 * that wouldn't handle well to talk between the node and browser env
 */
export class FileUtils {
    public download(source: string, dest: string): Promise<string> {
        return download(source, path.dirname(dest), {
            filename: path.basename(dest),
        }).then(() => dest);
    }

    public unzip(source: string, dest: string): Promise<void> {
        return new Promise((resolve, reject) => {
            extract(source, { dir: dest }, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}
