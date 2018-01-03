const { SharedKeyCredentials, BatchServiceClient } = require("azure-batch");

const accountName = "{0}";
const accountUrl = "{1}";
const accountKey = "{2}";

const credentials = new SharedKeyCredentials(accountName, accountKey);
const batchClient = new ServiceClient(credentials, accountUrl);

async function run() {
    const jobs = await batchClient.job.list();

    for (const job of jobs) {
        // tslint:disable-next-line:no-console
        console.log(job.id);
    }
}

run().then(() => {
    process.exit();
});
