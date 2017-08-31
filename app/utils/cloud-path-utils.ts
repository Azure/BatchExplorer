export class CloudPathUtils {
    public static normalize(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static join(...paths: string[]) {
        return paths.join("/");
    }

    public static asBaseDirectory(path: string): string {
        const norm = CloudPathUtils.normalize(path);
        if (norm.endsWith("/")) {
            return norm;
        }

        return `${norm}/`;
    }
}
