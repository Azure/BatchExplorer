import { PoolEndpointConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class PoolEndpointConfigurationDecorator extends DecoratorBase<PoolEndpointConfiguration> {
    public inboundNATPools: any[];

    constructor(poolEndpointConfiguration: PoolEndpointConfiguration) {
        super(poolEndpointConfiguration);
        if (poolEndpointConfiguration.inboundNATPools) {
            this.inboundNATPools = poolEndpointConfiguration.inboundNATPools.map(pool => {
                return {
                    name: this.stringField(pool.name),
                    backendPort: this.stringField(pool.backendPort),
                    frontendPortRange: `${pool.frontendPortRangeStart} - ${pool.frontendPortRangeEnd}`,
                    protocol: this.stringField(pool.protocol),
                    networkSecurityRules: pool.networkSecurityGroupRules,
                };
            }).toArray();
        }
    }
}
