import { Dto, DtoAttr } from "@batch-flask/core/dto";
import { PoolEndPointConfigurationDto } from "./pool-endpoint-configuration.dto";

export class NetworkConfigurationDto extends Dto<NetworkConfigurationDto> {
    @DtoAttr() public subnetId: string;
    @DtoAttr() public endpointConfiguration: PoolEndPointConfigurationDto;
}
