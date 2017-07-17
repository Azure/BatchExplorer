import * as fs from "fs";
import { get } from "http";

export class FileUtils {
    public static download(source: string, destination: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(destination);
            const request = get(source, (response) => {
                response.pipe(file);
                file.on("finish", function () {
                    file.close();  // close() is async, call cb after close completes.
                    resolve(destination);
                });
            }).on("error", (err) => { // Handle errors
                fs.unlink(destination); // Delete the file async. (But we don't check the result)
                reject(err);
            });
        });
    }
}
