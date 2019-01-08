import { Dto, DtoAttr } from "@batch-flask/core";

export class ResourceFileDto extends Dto<ResourceFileDto> {
    @DtoAttr() public httpUrl: string;
    @DtoAttr() public filePath: string;
    @DtoAttr() public fileMode?: string;
}
