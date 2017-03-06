import { ResourceFile } from "./resource-file";

/**
 * Settings which specify how to run a multi-instance task
 */
export class MultiInstanceSettings {
    public numberOfInstances: number;
    public coordinationCommandLine: string;
    public commonResourceFiles: ResourceFile[];
}
