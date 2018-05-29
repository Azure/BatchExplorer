export class UrlUtils {
    public static isHttpUrl(url: string) {
        return /^https?:\/\/.*$/.test(url);
    }
}
