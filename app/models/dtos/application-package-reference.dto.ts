import { Dto, DtoAttr } from "@batch-flask/core";

export class AppPackageReferenceDto extends Dto<AppPackageReferenceDto> {
    @DtoAttr()
    public applicationId: string;

    @DtoAttr()
    public version: string;
}
