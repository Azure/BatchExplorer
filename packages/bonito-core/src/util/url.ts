import { getEnvironment } from "../environment";

/**
 * Get the globally configured base path, normalized to always include both
 * leading and trailing forward slashes.
 *
 * For example, if the basePath config property is "foo", this function will
 * return "/foo/".
 */
export function getNormalizedBasePath(): string {
    let basePath = getEnvironment().getBasePath();
    if (!basePath.endsWith("/")) {
        basePath = basePath + "/";
    }
    if (!basePath.startsWith("/")) {
        basePath = "/" + basePath;
    }
    return basePath;
}

/**
 * Returns a normalized URL which is either absolute, or if relative
 * always includes a leading slash and any configured base path.
 *
 * @param url A relative or absolute URL string
 * @returns A normalized URL string
 */
export function normalizeUrl(url: string): string {
    if (!url || typeof url !== "string") {
        throw new Error("Cannot normalize invalid URL: " + url);
    }

    if (url.indexOf("http") === 0) {
        // Absolute URLs are left untouched
        return url;
    }

    const relPath = url.charAt(0) === "/" ? url.substring(1) : url;
    return getNormalizedBasePath() + relPath;
}
