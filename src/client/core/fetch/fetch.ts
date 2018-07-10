import { app, net } from "electron";
import { Headers } from "./headers";
import { Request, RequestInit } from "./request";
import { Response } from "./response";

export async function fetch(url: string, options: RequestInit = {}): Promise<Response<any>> {
    await app.isReady();
    const request = new Request(url, options);

    return new Promise<Response<any>>((resolve, reject) => {
        const req = net.request(getRequestOptions(request));

        req.on("response", (res) => {
            const headers = new Headers();

            for (const name of Object.keys(res.headers)) {
                if (Array.isArray(res.headers[name])) {
                    for (const val of res.headers[name]) {
                        headers.append(name, val);
                    }
                } else {
                    headers.append(name, res.headers[name]);
                }
            }

            const responseOptions = {
                url: request.url,
                status: res.statusCode,
                statusText: res.statusMessage,
                headers: headers,
            };

            const response = new Response(res as any, responseOptions as any);
            if (response.ok) {
                resolve(response);
            } else {
                reject(response);
            }
        });
        req.on("error", (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

function getRequestOptions(request: Request) {
    console.log("Headeres", request.headers);
    return {
        url: request.url,
        method: request.method,
        headers: request.headers.raw(),
    };
}
