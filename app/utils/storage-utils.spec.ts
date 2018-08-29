import { StorageUtils } from "app/utils";

fdescribe("StorageUtils", () => {
    it("Throws error if no jobId supplied", (done) => {
        StorageUtils.getSafeContainerName(null).catch((error) => {
            expect(error.message).toEqual("No jobId supplied to getSafeContainerName(jobId: string)");
            done();
        });
    });

    it("Generates safe container name", async () => {
        assertName("job-15", "job-job-15");
        assertName("MyTerrificJob", "job-myterrificjob");
        assertName("J", "job-j");
        assertName("j", "job-j");
    });

    it("Replaces invalid characters", async () => {
        assertName("my_job-bob", "job-my-job-bob-e04620bc2add214df74e158ba60d24273a0e0927");
        assertName("-my_job-sam--", "job-my-job-sam-47f54d840815af2592a12213db05f8a8277a098d");
        assertName("my-_EVEN_MORE_-terrific-job", "job-my-even-more-te-68b05a7d8aa6aa65b9a6892c667a6c406a16ad65");
        assertName("job:my-job-1", "job-job-my-job-1-fdddfdd04eab0771edb90374860d2736481d162d");
        assertName("---", "job-job-58b63e273b964039d6ef432a415df3f177c818e5");
        assertName("-_-", "job-job-6fe16b401f95cfcf3aba78023b0a14ef782813e1");
        assertName("-", "job-job-3bc15c8aae3e4124dd409035f32ea2fd6835efc9");
        assertName("_", "job-job-53a0acfad59379b3e050338bf9f23cfc172ee787");
        assertName(":", "job-job-05a79f06cf3f67f726dae68d18a2290f6c9a50c9");

        // tslint:disable-next-line
        assertName("myverylongjobnameallinonewordreallystartingtogetreallysillynow", "job-myverylongjobna-a8700e4947d0c8c621e53b24246aa0349d830e41");
    });
});

async function assertName(jobId: string, expected: string) {
    const containerName = await StorageUtils.getSafeContainerName(jobId);
    expect(containerName).toEqual(expected, "expected: " + expected + " ok");
}
