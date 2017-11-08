import { Dto, DtoAttr } from "app/core";

export class AppPackageReferenceDto extends Dto<AppPackageReferenceDto> {
    @DtoAttr()
    public applicationId: string;

    @DtoAttr()
    public version: string;
}
