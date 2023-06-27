import { STATUS_CODES } from "http";
import { Headers } from "./headers";

export class Response<T> {
    public headers: Headers;
    public statusText: string;
    public status: number;
    public url: string;

    constructor(private body: Electron.IncomingMessage, opts: any = {}) {
        this.url = opts.url;
        this.status = opts.status || 200;
        this.statusText = opts.statusText || STATUS_CODES[this.status];
        this.headers = new Headers(opts.headers);
    }

    public async buffer(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunks: Buffer[] = [];
            this.body.on("data", (chunk) => {
                chunks.push(chunk);
            });

            this.body.on("end", (chunk) => {
                resolve(Buffer.concat(chunks));
            });

            this.body.on("error", (e) => {
                reject(e);
            });
        });
    }

    public async text(): Promise<string> {
        const buffer = await this.buffer();
        return buffer.toString();
    }

    public async json(): Promise<T> {
        const content = await this.text();
        return JSON.parse(content);
    }

    get ok() {
        return this.status >= 200 && this.status < 300;
    }
}
