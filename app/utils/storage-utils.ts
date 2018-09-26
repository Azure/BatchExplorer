export class StorageUtils {
    public static containerUrlRegex = /https?:\/\/(.*)\.blob\.core\.windows\.net\/(.*)\?.*/;

    public static getContainerFromUrl(url: string) {
        const match = this.containerUrlRegex.exec(url);

        if (!match) { return null; }

        return {
            account: match[1],
            container: match[2],
        };
    }

    /**
     * The job output container name is formed according to the following rules:
     *  - Normalize the job ID to lower case. (Due to the restricted set of letters permitted in IDs, there
     *    are no locale issues with this normalization). A job ID can only contain any combination of
     *    alphanumeric characters including hyphens and underscores.
     *  - If prepending "job-" to the normalized ID gives a valid container name, use that.
     *  - Otherwise:
     *      - Calculate the SHA1 hash of the normalized ID, and express it as a 40-character hex string.
     *      - Replace all sequences of one or more hyphens or underscores in the normalized ID by single hyphens,
     *        then remove any leading or trailing hyphens.
     *      - If the resulting string is empty, use the string "job" instead.
     *      - If the resulting string is longer than 15 characters, truncate it to 15 characters. If truncation
     *        results in a trailing hyphen, remove it.
     *      - The container name is the string "job-", followed by the truncated ID, followed by a hyphen,
     *        followed by the hash.
     *
     * @param jobId: the job identifier
     * @returns { normalized container name for the job }
     */
    public static async getSafeContainerName(jobId: string): Promise<string> {
        if (!jobId) {
            throw new Error("No jobId supplied to getSafeContainerName(jobId: string)");
        }

        const containerName = await this._getUnprefixedSafeContainerName(jobId);
        return this._jobPrefix + containerName;
    }

    public static isClassic(storageAccountId: string): boolean {
        return storageAccountId.contains("Microsoft.ClassicStorage/storageAccounts");
    }

    private static _jobPrefix = "job-";
    private static _singleDashChar = "-";
    private static _maxUsableJobIdLength = 63 - StorageUtils._jobPrefix.length;
    private static _regexPermittedContainerNamePattern = /^[a-z0-9][a-z0-9-]*$/i;
    private static _regexInvalidCharacters = /[:_-]{1,}/g;
    private static _regexTrimStartAndEnd = /^[-]|[-]+$/g;

    // Must be <= 63 - "job-".Length - 1 (hyphen before hash) - length of hash string (40 for SHA1)
    private static _maxJobIdLengthInMungedContainerName = 15;

    private static async _getUnprefixedSafeContainerName(jobId: string): Promise<string> {
        /*
         * It's safe to do this early as job id's cannot differ only by case, so the lower case job id
         * is still a unique identifier
         */
        jobId = jobId.toLowerCase();

        // Check that jobId is of the correct length
        if (jobId.length > this._maxUsableJobIdLength) {
            return this._mungeToContainerName(jobId);
        }

        // Check that jobId only contains valid characters and doesnt start with a '-'
        if (!this._regexPermittedContainerNamePattern.test(jobId)) {
            return this._mungeToContainerName(jobId);
        }

        // Check that jobId doesn't contain any sequence of "--", and that it doesn't end with a "-"
        if (jobId.indexOf("--") !== -1 || jobId.charAt(jobId.length - 1) === this._singleDashChar) {
            return this._mungeToContainerName(jobId);
        }

        return jobId;
    }

    private static async _mungeToContainerName(jobId: string): Promise<string> {
        const hash = await this._getJobIdHash(jobId);
        const hashText = hash;
        let safeString = jobId.replace(this._regexInvalidCharacters, this._singleDashChar);
        safeString = safeString.replace(this._regexTrimStartAndEnd, "");

        if (safeString.length > this._maxJobIdLengthInMungedContainerName) {
            safeString = safeString.substr(0, this._maxJobIdLengthInMungedContainerName);

            // do this again as truncation may have unleashed a trailing dash
            safeString = safeString.trimEnd(this._singleDashChar);
        } else if (safeString.length === 0) {
            safeString = "job";
        }

        return safeString + "-" + hashText;
    }

    private static async _getJobIdHash(jobId: string): Promise<string> {
        const jobIdBytes = new TextEncoder().encode(jobId);

        const hash = await crypto.subtle.digest("SHA-1", jobIdBytes);
        return this._hex(hash);
    }

    private static _hex(buffer: any) {
        const hexCodes: string[] = [];
        const view = new DataView(buffer);
        const padding = "00000000";

        for (let i = 0; i < view.byteLength; i += 4) {
            const value = view.getUint32(i);
            const stringValue = value.toString(16);
            const paddedValue = (padding + stringValue).slice(-padding.length);

            hexCodes.push(paddedValue);
        }

        // join all the hex strings into one
        return hexCodes.join("");
    }
}
