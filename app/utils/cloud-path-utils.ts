export class CloudPathUtils {
    public static normalized(path: string): string {
        return path.replace(/\\/g, "/");
    }

    public static join(...paths: string[]) {
        return paths.join("/");
    }

    public static asBaseDirectory(path: string): string {
        const norm = CloudPathUtils.normalized(path);
        if (norm.endsWith("/")) {
            return norm;
        }

        return `${norm}/`;
    }
}
