import { Dto, DtoAttr } from "@batch-flask/core";

export class OutputFileBlobContainerDestinationDto extends Dto<OutputFileBlobContainerDestinationDto> {
    @DtoAttr() public containerUrl: string;
    @DtoAttr() public path: string;
}

export class OutputFileDestinationDto extends Dto<OutputFileUploadOptionsDto> {
    @DtoAttr() public container: OutputFileBlobContainerDestinationDto;
}

export class OutputFileUploadOptionsDto extends Dto<OutputFileUploadOptionsDto> {
    @DtoAttr() public taskcompletion: string;
    @DtoAttr() public taskfailure: string;
    @DtoAttr() public tasksuccess: string;
}

export class OutputFileDto extends Dto<OutputFileDto> {
    @DtoAttr() public destintation: OutputFileDestinationDto;
    @DtoAttr() public filePattern: string;
    @DtoAttr() public uploadOptions: OutputFileUploadOptionsDto;
}
