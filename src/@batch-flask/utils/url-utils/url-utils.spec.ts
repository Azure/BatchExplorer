import { UrlUtils } from "./url-utils";

describe("UrlUtils", () => {
    it("#isHttpUrl() returns true only when starts with http(s)://", () => {
        expect(UrlUtils.isHttpUrl("https://banana")).toBe(true);
        expect(UrlUtils.isHttpUrl("https://example.com")).toBe(true);
        expect(UrlUtils.isHttpUrl("https://example.com/long/path/to/file.txt")).toBe(true);
        expect(UrlUtils.isHttpUrl("http://example.com")).toBe(true);
        expect(UrlUtils.isHttpUrl("ftp://example.com")).toBe(false);
        expect(UrlUtils.isHttpUrl("data://abcdefghi")).toBe(false);
    });
});
