import { Dto, DtoAttr } from "@batch-flask/core";

export class ResourceFileDto extends Dto<ResourceFileDto> {
    @DtoAttr() public httpUrl: string;
    @DtoAttr() public filePath: string;
    @DtoAttr() public fileMode?: string;
    @DtoAttr() public autoStorageContainerName?: string;
    @DtoAttr() public storageContainerUrl?: string;
    @DtoAttr() public blobPrefix?: string;
}
