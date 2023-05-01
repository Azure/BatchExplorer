import { DownloaderHelper } from "node-downloader-helper";
import * as extract from "extract-zip";
import * as path from "path";

/**
 * Helper method for file releated actions.
 * This should contains action where you use stream or large file
 * that wouldn't handle well to talk between the node and browser env
 */
export class FileUtils {
    public download(source: string, dest: string): Promise<string> {
        const downloader = new DownloaderHelper(source, path.dirname(dest), {
            fileName: path.basename(dest)
        });
        return new Promise((resolve, reject) => {
            downloader.on("end", () => {
                resolve(dest);
            });
            downloader.on("error", (err) => {
                reject(err);
            });
            downloader.start();
        });
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
