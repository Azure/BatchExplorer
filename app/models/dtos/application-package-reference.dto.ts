import { Dto, DtoAttr } from "@bl-common/core";

export class AppPackageReferenceDto extends Dto<AppPackageReferenceDto> {
    @DtoAttr()
    public applicationId: string;

    @DtoAttr()
    public version: string;
}
