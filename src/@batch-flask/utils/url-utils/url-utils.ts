export class UrlUtils {
    // eslint-disable-next-line max-len
    public static readonly URL_REGEX = new RegExp("^(https?:\\/\\/)?" + // protocol
        "(localhost|" + // localhost
        "(([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // OR domain name and extension
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?" + // port
        "(\\/[-a-z\\d%@_.~+&:]*)*" + // path
        "(\\?[;&a-z\\d%@_.,~+&:=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$", "i"); // fragment locator

    public static isHttpUrl(url: string) {
        return /^https?:\/\/.*$/.test(url);
    }

    public static isUrl(value: string): boolean {
        return this.URL_REGEX.test(value);
    }
}
