import { Headers } from "./headers";

export interface RequestInit {
    headers?: Headers | StringMap<string>;
    method?: string;
    body?: string;
}

export class Request {
    public _opts: RequestInit;
    public headers: Headers;
    public method: string | undefined;

    constructor(public url: string, opts: RequestInit = {}) {
        this._opts = opts;
        this.method = opts.method;
        this.headers = new Headers(opts.headers);
    }
}
