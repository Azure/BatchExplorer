import { ContainerType } from "app/models";
import { List } from "immutable";
import { Pool } from "./pool";

describe("Pool Model", () => {
    it("do sutff", () => {
        const pool = new Pool({
            virtualMachineConfiguration: {
                containerConfiguration: {
                    type: ContainerType.DockerCompatible,
                    containerRegistries: [
                        {
                            username: "abc",
                            password: "foo",
                            registryServer: "hub.docker.com",
                        },
                    ],
                },
            },
        });

        expect(pool.virtualMachineConfiguration).not.toBeFalsy();
        const containerConfig = pool.virtualMachineConfiguration.containerConfiguration;
        expect(containerConfig).not.toBeFalsy();

        expect(containerConfig.containerImageNames).not.toBeFalsy();
        expect(containerConfig.containerImageNames instanceof List);
        expect(containerConfig.containerImageNames.size).toBe(0);

        expect(containerConfig.containerRegistries).not.toBeFalsy();
        expect(containerConfig.containerRegistries instanceof List);
        expect(containerConfig.containerRegistries.size).toBe(1);
    });
});
