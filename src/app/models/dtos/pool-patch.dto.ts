import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { AppPackageReferenceDto } from "./application-package-reference.dto";
import { CertificateReferenceDto } from "./certificate-reference.dto";
import { MetaDataDto } from "./metadata.dto";
import { StartTaskDto } from "./start-task.dto";

export class PoolPatchDto extends Dto<PoolPatchDto> {
    @DtoAttr()
    public metadata?: MetaDataDto[];

    @DtoAttr()
    public startTask?: StartTaskDto;

    @ListDtoAttr(CertificateReferenceDto)
    public certificateReferences?: CertificateReferenceDto[];

    @ListDtoAttr(AppPackageReferenceDto)
    public applicationPackageReferences?: AppPackageReferenceDto[];
}
