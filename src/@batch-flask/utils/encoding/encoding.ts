import * as jschardet from "jschardet";

const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512; // number of bytes to look at to decide about a file being binary or not
// const NO_GUESS_BUFFER_MAX_LEN = 512; 			// when not auto guessing the encoding, small number of bytes are enough
// const AUTO_GUESS_BUFFER_MAX_LEN = 512 * 8; 		// with auto guessing we want a lot more content to be read for guessing
const MINIMUM_THRESHOLD = 0.2;
const IGNORE_ENCODINGS = ["ascii", "utf-8", "utf-16", "utf-32"];

export enum Encoding {
    UTF8 = "utf-8",
    UTF16be = "utf-16be",
    UTF16le = "utf-16le",
}

export interface EncodingResult {
    encoding: Encoding;
    seemsBinary: boolean;
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

    public static async detectEncodingFromBuffer(
        { buffer, bytesRead },
        autoGuessEncoding: boolean = true): Promise<EncodingResult> {

        let encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, bytesRead);
        // Detect 0 bytes to see if file is binary or UTF-16 LE/BE
        // unless we already know that this file has a UTF-16 encoding
        let seemsBinary = false;
        if (encoding !== Encoding.UTF16be && encoding !== Encoding.UTF16le) {
            let couldBeUTF16LE = true; // e.g. 0xAA 0x00
            let couldBeUTF16BE = true; // e.g. 0x00 0xAA
            let containsZeroByte = false;
            // This is a simplified guess to detect UTF-16 BE or LE by just checking if
            // the first 512 bytes have the 0-byte at a specific location. For UTF-16 LE
            // this would be the odd byte index and for UTF-16 BE the even one.
            // Note: this can produce false positives (a binary file that uses a 2-byte
            // encoding of the same format as UTF-16) and false negatives (a UTF-16 file
            // that is using 4 bytes to encode a character).
            for (let i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
                const isEndian = (i % 2 === 1); // assume 2-byte sequences typical for UTF-16
                const isZeroByte = (buffer.readInt8(i) === 0);

                if (isZeroByte) {
                    containsZeroByte = true;
                }

                // UTF-16 LE: expect e.g. 0xAA 0x00
                if (couldBeUTF16LE && (isEndian && !isZeroByte || !isEndian && isZeroByte)) {
                    couldBeUTF16LE = false;
                }

                // UTF-16 BE: expect e.g. 0x00 0xAA
                if (couldBeUTF16BE && (isEndian && isZeroByte || !isEndian && !isZeroByte)) {
                    couldBeUTF16BE = false;
                }

                // Return if this is neither UTF16-LE nor UTF16-BE and thus treat as binary
                if (isZeroByte && !couldBeUTF16LE && !couldBeUTF16BE) {
                    break;
                }
            }

            // Handle case of 0-byte included
            if (containsZeroByte) {
                if (couldBeUTF16LE) {
                    encoding = Encoding.UTF16le;
                } else if (couldBeUTF16BE) {
                    encoding = Encoding.UTF16be;
                } else {
                    seemsBinary = true;
                }
            }
        }
        // Auto guess encoding if configured
        if (autoGuessEncoding && !seemsBinary && !encoding) {
            const encoding = await EncodingUtils.guessEncodingByBuffer(buffer.slice(0, bytesRead));
            return {
                seemsBinary: false,
                encoding,
            };
        }

        return { seemsBinary, encoding };
    }

    public static detectEncodingByBOMFromBuffer(buffer: any, bytesRead: number): Encoding {
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

    public static async guessEncodingByBuffer(buffer): Promise<Encoding> {
        jschardet.Constants.MINIMUM_THRESHOLD = MINIMUM_THRESHOLD;

        const guessed = jschardet.detect(buffer);
        if (!guessed || !guessed.encoding) {
            return null;
        }

        const enc = guessed.encoding.toLowerCase();

        // Ignore encodings that cannot guess correctly
        // (http://chardet.readthedocs.io/en/latest/supported-encodings.html)
        if (0 <= IGNORE_ENCODINGS.indexOf(enc)) {
            return null;
        }

        return guessed.encoding;
    }
}
