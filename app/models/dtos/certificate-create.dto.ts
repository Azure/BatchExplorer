import { Dto, DtoAttr } from "@batch-flask/core";

export class CertificateCreateDto extends Dto<CertificateCreateDto> {
    @DtoAttr() public certificate?: string;
    @DtoAttr() public password?: string;
}
