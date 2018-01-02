export class CloudPathUtils {
    public static normalize(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static join(...paths: string[]) {
        return paths.filter(x => Boolean(x)).map(x => x.trimEnd("/")).join("/");
    }

    public static dirname(path: string): string {
        return path.split("/").slice(0, -1).join("/");
    }

    public static asBaseDirectory(path: string): string {
        const norm = CloudPathUtils.normalize(path);
        if (norm.endsWith("/")) {
            return norm;
        }

        return `${norm}/`;
    }
}
