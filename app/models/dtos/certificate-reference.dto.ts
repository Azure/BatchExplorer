import { Dto, DtoAttr } from "@batch-flask/core";

export class CertificateReferenceDto extends Dto<CertificateReferenceDto> {
    @DtoAttr() public storeLocation: string;
    @DtoAttr() public storeName: string;
    @DtoAttr() public thumbprint: string;
    @DtoAttr() public thumbprintAlgorithm: string;
    @DtoAttr() public visibility: string[];
}
