import { ElectronRemote } from "./electron";

export class BatchLabsService {
    constructor(private remote: ElectronRemote) {

    }

    public get azureEnvironment() {
        // TODO-TIM change to be more performant
        return this.remote.getBatchLabsApp().azureEnvironment;
    }
}
