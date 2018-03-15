import { Dto, DtoAttr } from "@batch-flask/core";

export type CertificateFormat = "cer" | "pfx";

export class CertificateCreateDto extends Dto<CertificateCreateDto> {
    @DtoAttr() public thumbprintAlgorithm?: string;

    @DtoAttr() public thumbprint?: string;

    @DtoAttr() public password?: string;

    @DtoAttr() public data?: string;

    @DtoAttr() public certificateFormat?: CertificateFormat;
}
