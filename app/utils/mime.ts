import { Encoding, EncodingUtils } from "./encoding";

const ZERO_BYTE_DETECTION_BUFFER_MAX_LEN = 512;

export class Mime {
    public static MIME_TEXT = "text/plain";
    public static MIME_BINARY = "application/octet-stream";
    public static MIME_UNKNOWN = "application/unknown";
}

export class MimeUtils {
    public static detectMimeAndEncodingFromBuffer({ buffer, bytesRead }, autoGuessEncoding?: boolean): any {
        let enc = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, bytesRead);
        // Detect 0 bytes to see if file is binary (ignore for UTF 16 though)
        let isText = true;

        if (enc !== Encoding.UTF16be && enc !== Encoding.UTF16le) {
            for (let i = 0; i < bytesRead && i < ZERO_BYTE_DETECTION_BUFFER_MAX_LEN; i++) {
                if (buffer.readInt8(i) === 0) {
                    isText = false;
                    break;
                }
            }
        }

        return {
            mimes: isText ? [Mime.MIME_TEXT] : [Mime.MIME_BINARY],
            encoding: enc,
        };
    }
}
