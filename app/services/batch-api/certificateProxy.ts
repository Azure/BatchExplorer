import { BatchServiceClient, BatchServiceModels } from "azure-batch";

import { ListProxy, mapGet, wrapOptions } from "./shared";

export class CertificateProxy {

    constructor(private client: BatchServiceClient) {
    }

    /**
     * Adds a certificate to the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/CertificateOperations.html#add
     * @param certificate: The certificate object
     * @param options: Optional Parameters.
     */
    public add(certificate: any, options?: any): Promise<any> {
        return this.client.certificate.add(certificate, wrapOptions(options));
    }

    /**
     * Deletes a certificate from the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/CertificateOperations.html#deleteMethod
     * @param thumbprintAlgorithm: The algorithm used to derive the thumbprint parameter. This must be sha1.
     * @param thumbprint: The thumbprint of the certificate to be deleted.
     * @param options: Optional Parameters.
     */
    public delete(thumbprintAlgorithm: string, thumbprint: string, options?: any): Promise<any> {
        return this.client.certificate.deleteMethod(thumbprintAlgorithm, thumbprint, wrapOptions(options));
    }

    /**
     * Cancels a failed deletion of a certificate from the specified account.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/CertificateOperations.html#cancelDeletion
     * @param thumbprintAlgorithm: The algorithm used to derive the thumbprint parameter. This must be sha1.
     * @param thumbprint: The thumbprint of the certificate being deleted
     * @param options: Optional Parameters.
     */
    public cancelDeletion(thumbprintAlgorithm: string, thumbprint: string, options?: any): Promise<any> {
        return this.client.certificate.cancelDeletion(thumbprintAlgorithm, thumbprint, wrapOptions(options));
    }

    /**
     * Gets information about the specified certificate.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/CertificateOperations.html#get
     * @param thumbprintAlgorithm: The algorithm used to derive the thumbprint parameter. This must be sha1.
     * @param thumbprint: The thumbprint of the certificate to get.
     * @param options: Optional Parameters.
     */
    public get(thumbprintAlgorithm: string, thumbprint: string, options?: BatchServiceModels.CertificateGetOptions)
        : Promise<any> {
        return mapGet(this.client.certificate.get(thumbprintAlgorithm, thumbprint, wrapOptions({
            certificateGetOptions: options,
        })));
    }

    /**
     * Lists all of the certificates that have been added to the specified
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/CertificateOperations.html#list
     * @param options: Optional Parameters.
     */
    public list(options?: BatchServiceModels.CertificateListOptions) {
        return new ListProxy(this.client.certificate, null, wrapOptions({ certificateListOptions: options }));
    }
}
