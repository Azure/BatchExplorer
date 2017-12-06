
export enum Encoding {
    UTF8 = "utf-8",
    UTF16be = "utf-16be",
    UTF16le = "utf-16le",
}

export class EncodingUtils {
    public static Encoding = Encoding;

    public static bomLength(encoding: string): number {
        switch (encoding) {
            case Encoding.UTF8:
                return 3;
            case Encoding.UTF16be:
            case Encoding.UTF16le:
                return 2;
        }

        return 0;
    }

    public static detectEncodingByBOMFromBuffer(buffer: NodeBuffer, bytesRead: number): string {
        if (!buffer || bytesRead < 2) {
            return null;
        }

        const b0 = buffer.readUInt8(0);
        const b1 = buffer.readUInt8(1);

        // UTF-16 BE
        if (b0 === 0xFE && b1 === 0xFF) {
            return Encoding.UTF16be;
        }

        // UTF-16 LE
        if (b0 === 0xFF && b1 === 0xFE) {
            return Encoding.UTF16le;
        }

        if (bytesRead < 3) {
            return null;
        }

        const b2 = buffer.readUInt8(2);

        // UTF-8
        if (b0 === 0xEF && b1 === 0xBB && b2 === 0xBF) {
            return Encoding.UTF8;
        }

        return null;
    }
}
