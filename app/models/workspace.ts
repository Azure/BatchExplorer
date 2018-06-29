/**
 * probably needs to take a json file, or a path to a json file and load it.
 * builds a feature map of enabled and disabled features.
 */
export class Workspace {
    public id: string;
    public name: string;
    public description: string;

    public constructor(id: string, name: string) {
        id = id;
        name = name;
    }

    public isFeatureEnabled(feature: string): boolean {
        return true;
    }

    public isFeatureDisabled(feature: string): boolean {
        return false;
    }
}
