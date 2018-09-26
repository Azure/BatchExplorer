export class UrlUtils {
    // tslint:disable-next-line:max-line-length
    public static readonly URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;

    public static isHttpUrl(url: string) {
        return /^https?:\/\/.*$/.test(url);
    }
}
