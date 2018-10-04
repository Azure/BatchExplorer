import { Encoding, EncodingUtils } from "@batch-flask/utils";

async function loadFile(file: string): Promise<Buffer> {
    const response = await fetch(`base/test/fixtures/encoding/${file}`);
    const reader = response.body.getReader();
    const result = await reader.read();
    if (result.value) {
        return Buffer.from(result.value.buffer);
    } else {
        return Buffer.from("");
    }
}

describe("Encoding", () => {
    describe("detectEncodingByBOMFromBuffer", () => {
        it("detectBOM UTF-8", async () => {
            const buffer = await loadFile("some_utf8.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf-8");
        });

        it("detectBOM UTF-16 LE", async () => {
            const buffer = await loadFile("some_utf16le.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf-16le");
        });

        it("detectBOM UTF-16 BE", async () => {
            const buffer = await loadFile("some_utf16be.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf-16be");
        });

        it("detectBOM  ANSI", async () => {
            const buffer = await loadFile("some_ansi.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual(null);
        });

        it("detectBOM ANSI when empty", async () => {
            const buffer = await loadFile("empty.txt");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual(null);
        });
    });

    describe("detectEncodingFromBuffer", () => {
        it("detectEncodingFromBuffer (JSON saved as PNG) as not binary", async () => {
            const buffer = await loadFile("some.json.png");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
        });

        it("detectEncodingFromBuffer (PNG saved as TXT) as binary", async () => {
            const buffer = await loadFile("some.png.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(true);
        });

        it("detectEncodingFromBuffer (XML saved as PNG) as non binary", async () => {
            const buffer = await loadFile("some.xml.png");
            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
        });

        it("detectEncodingFromBuffer (QWOFF saved as TXT) as binary", async () => {
            const buffer = await loadFile("some.qwoff.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(true);
        });

        it("detectEncodingFromBuffer (CSS saved as QWOFF) as non binary", async () => {
            const buffer = await loadFile("some.css.qwoff");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
        });

        it("detectEncodingFromBuffer (PDF) as binary", async () => {
            const buffer = await loadFile("some.pdf");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(true);
        });

        it("detectEncodingFromBuffer (guess UTF-16 LE from content without BOM)", async () => {
            const buffer = await loadFile("utf16_le_nobom.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
            expect(mimes.encoding).toEqual(Encoding.UTF16le);
        });

        it("detectEncodingFromBuffer (guess UTF-16 BE from content without BOM)", async () => {
            const buffer = await loadFile("utf16_be_nobom.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
            expect(mimes.encoding).toEqual(Encoding.UTF16be);
        });

        it("detectEncodingFromBuffer (guess ShiftJIS)", async () => {
            const buffer = await loadFile("some.shiftjis.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
            expect(mimes.encoding).toEqual("SHIFT_JIS");
        });

        it("detectEncodingFromBuffer (guess CP1252)", async () => {
            const buffer = await loadFile("some.cp1252.txt");

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
            expect(mimes.encoding).toEqual("windows-1252");
        });
    });
});
