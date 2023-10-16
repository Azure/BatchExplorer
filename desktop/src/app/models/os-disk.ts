import { Model, Prop, Record } from "@batch-flask/core";

export interface OSDiskAttributes {
    ephemeralOSDiskSettings: DiffDiskSettings;
}

export interface DiffDiskSettingsAttributes {
    placement: DiffDiskPlacement;
}

export enum DiffDiskPlacement {
    CacheDisk = "CacheDisk",
}

@Model()
export class DiffDiskSettings extends Record<DiffDiskSettingsAttributes> {
    @Prop() public placement: DiffDiskPlacement;
}

@Model()
export class OSDisk extends Record<OSDiskAttributes> {
    @Prop() public ephemeralOSDiskSettings: DiffDiskSettings;
}
