import { Dto, DtoAttr } from "@batch-flask/core";
import { MetaDataDto } from "app/models/dtos";

export class PoolPatchDto extends Dto<PoolPatchDto> {
    @DtoAttr()
    public metadata?: MetaDataDto[];

    @DtoAttr()
    public startTask?: any;

    @DtoAttr()
    public certificateReferences?: any[];

    @DtoAttr()
    public applicationPackageReferences?: any[];
}
