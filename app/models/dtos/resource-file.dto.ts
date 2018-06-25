import { Dto, DtoAttr } from "@batch-flask/core";

export class ResourceFileDto extends Dto<ResourceFileDto> {
    @DtoAttr() public blobSource: string;
    @DtoAttr() public filePath: string;
    @DtoAttr() public fileMode?: string;
}
