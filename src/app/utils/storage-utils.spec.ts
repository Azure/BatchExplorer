import { StorageUtils } from "app/utils";

describe("StorageUtils", () => {
    it("Throws error if no jobId supplied", (done) => {
        StorageUtils.getSafeContainerName(null).catch((error) => {
            expect(error.message).toEqual("No jobId supplied to getSafeContainerName(jobId: string)");
            done();
        });
    });

    it("Generates safe container name", async () => {
        await assertName("job-15", "job-job-15");
        await assertName("MyTerrificJob", "job-myterrificjob");
        await assertName("J", "job-j");
        await assertName("j", "job-j");
    });

    it("Replaces invalid characters", async () => {
        await assertName("my_job-bob", "job-my-job-bob-e04620bc2add214df74e158ba60d24273a0e0927");
        await assertName("-my_job-sam--", "job-my-job-sam-47f54d840815af2592a12213db05f8a8277a098d");
        await assertName("my-_EVEN_MORE_-terrific-job", "job-my-even-more-te-68b05a7d8aa6aa65b9a6892c667a6c406a16ad65");
        await assertName("job:my-job-1", "job-job-my-job-1-fdddfdd04eab0771edb90374860d2736481d162d");
        await assertName("---", "job-job-58b63e273b964039d6ef432a415df3f177c818e5");
        await assertName("-_-", "job-job-6fe16b401f95cfcf3aba78023b0a14ef782813e1");
        await assertName("-", "job-job-3bc15c8aae3e4124dd409035f32ea2fd6835efc9");
        await assertName("_", "job-job-53a0acfad59379b3e050338bf9f23cfc172ee787");
        await assertName(":", "job-job-05a79f06cf3f67f726dae68d18a2290f6c9a50c9");

        // eslint-disable-next-line
        await assertName("myverylongjobnameallinonewordreallystartingtogetreallysillynow", "job-myverylongjobna-a8700e4947d0c8c621e53b24246aa0349d830e41");
    });

    describe("getContainerFromUrl()", () => {
        it("return null when invalid url", () => {
            expect(StorageUtils.getContainerFromUrl("https://invalid.com")).toBe(null);
            expect(StorageUtils.getContainerFromUrl("https://my-acc-1.blob.core.windows.net")).toBe(null);
            expect(StorageUtils.getContainerFromUrl("foo")).toBe(null);
        });

        it("parse correctly public cloud", () => {
            expect(StorageUtils.getContainerFromUrl("https://my-acc-1.blob.core.windows.net/my-container-1")).toEqual({
                account: "my-acc-1",
                container: "my-container-1",
            });
            // eslint-disable-next-line max-len
            expect(StorageUtils.getContainerFromUrl("https://my-acc-2.blob.core.windows.net/foo?st=2018-10-05T16%3A32%3A38Z&se=2018-10-06T16%3A47%3A38Z&sp=w&sv=2018-03-28&sr=c&sig=auiowghoaghwoiagw")).toEqual({
                account: "my-acc-2",
                container: "foo",
            });
        });

        it("parse correctly mooncake", () => {
            expect(
                StorageUtils.getContainerFromUrl("https://my-acc-1.blob.core.chinacloudapi.cn/my-container-1"),
            ).toEqual({
                account: "my-acc-1",
                container: "my-container-1",
            });
            // eslint-disable-next-line max-len
            expect(StorageUtils.getContainerFromUrl("https://my-acc-2.blob.core.chinacloudapi.cn/foo?st=2018-10-05T16%3A32%3A38Z&se=2018-10-06T16%3A47%3A38Z&sp=w&sv=2018-03-28&sr=c&sig=auiowghoaghwoiagw")).toEqual({
                account: "my-acc-2",
                container: "foo",
            });
        });
        it("parse correctly fairfax", () => {
            expect(
                StorageUtils.getContainerFromUrl("https://my-acc-1.blob.core.usgovcloudapi.net/my-container-1"),
            ).toEqual({
                account: "my-acc-1",
                container: "my-container-1",
            });
            // eslint-disable-next-line max-len
            expect(StorageUtils.getContainerFromUrl("https://my-acc-2.blob.core.usgovcloudapi.net/foo?st=2018-10-05T16%3A32%3A38Z&se=2018-10-06T16%3A47%3A38Z&sp=w&sv=2018-03-28&sr=c&sig=auiowghoaghwoiagw")).toEqual({
                account: "my-acc-2",
                container: "foo",
            });
        });
        it("parse correctly blackforeset", () => {
            expect(
                StorageUtils.getContainerFromUrl("https://my-acc-1.blob.core.cloudapi.de/my-container-1"),
            ).toEqual({
                account: "my-acc-1",
                container: "my-container-1",
            });
            // eslint-disable-next-line max-len
            expect(StorageUtils.getContainerFromUrl("https://my-acc-2.blob.core.cloudapi.de/foo?st=2018-10-05T16%3A32%3A38Z&se=2018-10-06T16%3A47%3A38Z&sp=w&sv=2018-03-28&sr=c&sig=auiowghoaghwoiagw")).toEqual({
                account: "my-acc-2",
                container: "foo",
            });
        });

    });
});

async function assertName(jobId: string, expected: string) {
    const containerName = await StorageUtils.getSafeContainerName(jobId);
    expect(containerName).toEqual(expected, "expected: " + expected + " ok");
}
