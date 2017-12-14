
namespace Microsoft.Azure.Batch.Samples.HelloWorld
{
    using System.Collections.Generic;

    public class AccountSettings {
        const string accountName = "{0}";
        const string accountUrl = "{1}";
        const string key = "{2}";
    }

    /// <summary>
    /// The main program of the HelloWorld sample
    /// </summary>
    public static class Program
    {
        public static void Main(string[] args)
        {
            // Set up the Batch Service credentials used to authenticate with the Batch Service.
            BatchSharedKeyCredentials credentials = new BatchSharedKeyCredentials(
                AccountSettings.url,
                AccountSettings.name,
                AccountSettings.key);

            // Get an instance of the BatchClient for a given Azure Batch account.
            using (BatchClient batchClient = await BatchClient.OpenAsync(credentials))
            {
                // Perform actions using the batchClient
                var jobs = batchClient.JobOperations.ListJobs()
            }
        }
    }
}
