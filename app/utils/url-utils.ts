export class UrlUtils {
    public static parseParams(queryParams: string): StringMap<string> {
        const params = {};
        for (const str of queryParams.split("&")) {
            const [key, value] = str.split("=");
            params[key] = value;
        }
        return params;
    }

    public static isHttpUrl(url: string) {
        return /^https?:\/\/.*$/.test(url);
    }
}
