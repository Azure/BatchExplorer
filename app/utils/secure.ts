// tslint:disable:no-bitwise

export class SecureUtils {

    /**
     * Generates a V4 random UUID (Universally Unique Identifier).
     */
    public static uuid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
