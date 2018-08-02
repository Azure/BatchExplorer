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

    public static username(length: number = 6): string {
        const charset = "abcdefghijklmnopqrstuvwxyz";
        let retVal = "";
        // create an array and fill with random integer
        const randomArray = new Uint32Array(length);
        window.crypto.getRandomValues(randomArray);
        for (let i = 0; i < length; i++) {
            retVal += charset.charAt(randomArray[i] % charset.length);
        }        
        return retVal;
    }

    public static password(length: number = 15): string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=";
        let retVal = "";
        // create an array and fill with random integer
        const randomArray = new Uint32Array(length);
        window.crypto.getRandomValues(randomArray);
        for (let i = 0; i < length; i++) {
            retVal += charset.charAt(randomArray[i] % charset.length);
        }
        return retVal;
    }

    public static generateWindowsPassword(length: number = 15): string {
        const charsets = [
            "abcdefghijklmnopqrstuvwxyz",
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "0123456789",
            "!@#$%^&*()_+~`|}{[]\\:;?><,./-=",
        ];
        const charsetJoined = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            + "!@#$%^&*()_+~`|}{[]\\:;?><,./-=";

        let retVal = "";
        // generate a random symbol from each charset
        const randomPrimary = new Uint32Array(4);
        window.crypto.getRandomValues(randomPrimary);
        for (let i = 0; i < 4; i++) {
            retVal += charsets[i].charAt(randomPrimary[i] % charsets[i].length);
        }

        // fill the rest of the password with random characters from any charset
        const remainingLength = length - 4;
        const randomSecondary = new Uint32Array(remainingLength);
        window.crypto.getRandomValues(randomSecondary);
        for (let i = 0; i < remainingLength; i++) {
            retVal += charsetJoined.charAt(randomSecondary[i] % charsetJoined.length);
        }
        return retVal;
    }

    /**
     * Generate a hexadecimal token
     */
    public static token(): string {
        const array = new Uint8Array(24);
        window.crypto.getRandomValues(array);
        return [...array].map(x => x.toString(16)).join("");
    }
}
