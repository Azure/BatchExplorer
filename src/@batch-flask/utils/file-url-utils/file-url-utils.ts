
export class FileUrlUtils {
    public static getFileName(fileUrl: string): string {
        const parts: string[] = fileUrl.split("/");
        return parts[parts.length - 1];
    }

    public static getFileExtension(fileUrl: string): string {
        return fileUrl.split(".").pop();
    }
}
