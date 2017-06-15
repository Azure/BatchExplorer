/**
 * A reference to an application package to be deployed to a compute nodes
 */
export class CertificateReference {
    public thumbprint: string;
    public thumbprintAlgorithm: string;
    public storeLocation: string;
    public storeName: string;
    public visibility: string[];
}
