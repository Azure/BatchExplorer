/**
 * Wrap options for all batch calls to add custom headers.
 * @param options Options
 */
import { Constants } from "../../../client-constants";
import { BatchResult } from "../models";

export function wrapOptions<T>(options?: T): T {
    const newOptions: any = options || {};
    if (!newOptions.customHeaders) {
        newOptions.customHeaders = {};
    }
    newOptions.customHeaders["User-Agent"] = `BatchLabs/${Constants.version}`;
    newOptions.customHeaders["Origin"] = `https://localhost`;
    newOptions.customHeaders["Host"] = `management.azure.com`;
    newOptions.customHeaders["Access-Control-Request-Headers"] = "Content-Length";
    newOptions.customHeaders["x-ms-client-request-id"] = "faf40371-2c5a-4998-bbf2-51d3d80d7010";
    newOptions.customHeaders["x-ms-client-session-id"] = "9014548e0a114486961125dc0b8d8a9f";
    return newOptions;
}

export function mapGet(promise: Promise<any>): Promise<BatchResult> {
    return promise.then((data) => {
        return { data };
    });
}

fetch("https://prodtest1.brazilsouth.batch.azure.com/pools?api-version=2017-09-01.6.0&maxresults=50", {
    headers: new Headers({
        Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjJLVmN1enFBaWRPTHFXU2FvbDd3Z0ZSR0NZbyIsImtpZCI6IjJLVmN1enFBaWRPTHFXU2FvbDd3Z0ZSR0NZbyJ9.eyJhdWQiOiJodHRwczovL2JhdGNoLmNvcmUud2luZG93cy5uZXQvIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3LyIsImlhdCI6MTUwODM0NjA2MSwibmJmIjoxNTA4MzQ2MDYxLCJleHAiOjE1MDgzNDk5NjEsIl9jbGFpbV9uYW1lcyI6eyJncm91cHMiOiJzcmMxIn0sIl9jbGFpbV9zb3VyY2VzIjp7InNyYzEiOnsiZW5kcG9pbnQiOiJodHRwczovL2dyYXBoLndpbmRvd3MubmV0LzcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0Ny91c2Vycy84YTBiZjYyYy0zNjI5LTQ2MTktYWJkNC04YzIyNTdmMjgyYmUvZ2V0TWVtYmVyT2JqZWN0cyJ9fSwiYWNyIjoiMSIsImFpbyI6IlkyTmdZSWcrNDFMMXdpOG8rcXJBTnpYclFET3h2c2FkSDZQMUp6LzQxNXJsbnREbnB3d0EiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiMDRiMDc3OTUtOGRkYi00NjFhLWJiZWUtMDJmOWUxYmY3YjQ2IiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJHdWVyaW4iLCJnaXZlbl9uYW1lIjoiVGltb3RoZWUiLCJpcGFkZHIiOiIxMzEuMTA3LjE1OS4xNDciLCJuYW1lIjoiVGltb3RoZWUgR3VlcmluIiwib2lkIjoiOGEwYmY2MmMtMzYyOS00NjE5LWFiZDQtOGMyMjU3ZjI4MmJlIiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEyNDUyNTA5NS03MDgyNTk2MzctMTU0MzExOTAyMS0xNTcwMjA4IiwicHVpZCI6IjEwMDMwMDAwOTQxQTM2NTciLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzdWIiOiJXbWhrTzJGclRfVy12QWtITjdwOTBkUzQ2QV9iVDdqclBUTml1d2RadzZrIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidW5pcXVlX25hbWUiOiJ0aWd1ZXJpbkBtaWNyb3NvZnQuY29tIiwidXBuIjoidGlndWVyaW5AbWljcm9zb2Z0LmNvbSIsInZlciI6IjEuMCJ9.JKvovSxooWT8vZ4ecfTg2cT4iMD2pBA-dcoc2F1O8nsCg-Oct2G8RUP-fAsfJkgA9UxxlrdfWghBUKzqM11clE0MbZ6qeClQCkYyI9ucz7RU9qBdHMrPV6NDoX_N62ifUvbth2VvY0In6lrUQsPu9m_oiSY-lkuQsAmPv0zBnjpV44NfqZQHdC9U6w4gw9-TV2zW3fBpzSz2b2nm2Gnk_1DYJ0_sVgVKJG0VGWhc6GSk4NlwQZPMUu1HL8iExmkdOR6or_GN0VP1tHQelcCNdS5kns4BsNBOWu2QxUVgcgLfNalAnQ_81GWU0xxmJIV8z_usB5gDoVQvXp0ySqrIow"
    })
})
