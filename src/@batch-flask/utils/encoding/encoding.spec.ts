import { EncodingUtils } from "@batch-flask/utils";

async function loadFile(file: string): Promise<Buffer> {
    const response = await fetch(`base/test/fixtures/encoding/${file}`);
    const arrayBuffer = await response.arrayBuffer();
    return new Buffer(arrayBuffer);
}

fdescribe("Encoding", () => {
    describe("detectEncodingByBOMFromBuffer", () => {
        fit("detectBOM UTF-8", async () => {
            const buffer = await loadFile("some_utf8.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf8");
        });

        it("detectBOM UTF-16 LE", async () => {
            const buffer = await loadFile("some_utf16le.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf16le");
        });

        it("detectBOM UTF-16 BE", async () => {
            const buffer = await loadFile("some_utf16be.css");

            const encoding = EncodingUtils.detectEncodingByBOMFromBuffer(buffer, buffer.length);
            expect(encoding).toEqual("utf16be");
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

        it("detectEncodingFromBuffer (JSON saved as PNG)", async () => {
            const buffer = await loadFile("some.json.png");
            console.log("File is", buffer);

            const mimes = await EncodingUtils.detectEncodingFromBuffer({ buffer, bytesRead: buffer.length });
            expect(mimes.seemsBinary).toEqual(false);
        });
    });
});
