import { Injectable } from "@angular/core";
import { BatchAccount, ImageInformation, ImageInformationAttributes, VerificationType } from "app/models";
import { PoolCreateDto } from "app/models/dtos";
import { ImageReferenceDto, VirtualMachineConfigurationDto } from "app/models/dtos/virtual-machine-configuration.dto";
import { Observable, empty } from "rxjs";
import { expand, map, reduce } from "rxjs/operators";
import { AzureBatchHttpService, BatchListResponse } from "../azure-batch/core";

export interface MultiRegionPoolBootstrapConfig {
    vmSize: string;
}

@Injectable({ providedIn: "root" })
export class MultiRegionPoolBootstrapService {
    private static readonly nearEolDaysThreshold = 365;
    private static readonly selectUbuntuError = "unspecified: cannot select UbuntuLTS from supportedimages";

    constructor(private readonly http: AzureBatchHttpService) {
    }

    public generatePoolId(location: string): string {
        const normalizedLocation = this._normalizeLocation(location);
        const timestamp = this._formatTimestamp(new Date());
        const randomSuffix = this._randomSuffix(4);
        return `bootstrap-${normalizedLocation}-${timestamp}-${randomSuffix}`;
    }

    public listSupportedImages(account: BatchAccount): Observable<ImageInformation[]> {
        return this.http.requestForAccount(account, "GET", "/supportedimages").pipe(
            expand((response: BatchListResponse<ImageInformationAttributes>) => {
                return response["odata.nextLink"]
                    ? this.http.requestForAccount(account, "GET", response["odata.nextLink"])
                    : empty();
            }),
            reduce((allImages, response: BatchListResponse<ImageInformationAttributes>) => {
                return allImages.concat((response && response.value) || []);
            }, [] as ImageInformationAttributes[]),
            map(images => images.map(x => new ImageInformation(x))),
        );
    }

    public selectUbuntuLtsImage(images: ImageInformation[]): ImageInformation {
        const ubuntuLtsImages = (images || []).filter(image => this._isCanonicalUbuntuLtsLinuxImage(image));
        if (ubuntuLtsImages.length === 0) {
            throw new Error(MultiRegionPoolBootstrapService.selectUbuntuError);
        }

        const verifiedCandidates = ubuntuLtsImages.filter(image => this._isVerified(image));
        const verificationPreferred = verifiedCandidates.length > 0 ? verifiedCandidates : ubuntuLtsImages;

        const nonNearEol = verificationPreferred.filter(image => !this._isNearEol(image));
        const eolPreferred = nonNearEol.length > 0 ? nonNearEol : verificationPreferred;

        const selectedImage = [...eolPreferred].sort((a, b) => this._compareUbuntuCandidates(a, b))[0];
        if (!selectedImage) {
            throw new Error(MultiRegionPoolBootstrapService.selectUbuntuError);
        }
        return selectedImage;
    }

    public buildBootstrapPoolCreateDto(
        config: MultiRegionPoolBootstrapConfig,
        poolId: string,
        selectedImage: ImageInformation
    ): PoolCreateDto {
        const commandLine = selectedImage?.osType?.toLowerCase() === "windows"
            ? "cmd /c \"echo bootstrap\""
            : "/bin/sh -c \"echo bootstrap\"";

        return new PoolCreateDto({
            id: poolId,
            vmSize: config.vmSize,
            targetDedicatedNodes: 0,
            enableAutoScale: false,
            virtualMachineConfiguration: new VirtualMachineConfigurationDto({
                nodeAgentSKUId: selectedImage.nodeAgentSKUId,
                imageReference: new ImageReferenceDto({
                    publisher: selectedImage.imageReference?.publisher,
                    offer: selectedImage.imageReference?.offer,
                    sku: selectedImage.imageReference?.sku,
                    version: selectedImage.imageReference?.version || "latest",
                    virtualMachineImageId: selectedImage.imageReference?.virtualMachineImageId,
                }),
            }),
            startTask: {
                commandLine,
            },
        });
    }

    private _normalizeLocation(location: string): string {
        return ((location || "unspecified")
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9-]/g, "")) || "unspecified";
    }

    private _formatTimestamp(date: Date): string {
        const year = date.getUTCFullYear();
        const month = this._pad2(date.getUTCMonth() + 1);
        const day = this._pad2(date.getUTCDate());
        const hour = this._pad2(date.getUTCHours());
        const minute = this._pad2(date.getUTCMinutes());
        return `${year}${month}${day}-${hour}${minute}`;
    }

    private _randomSuffix(length: number): string {
        let output = "";
        while (output.length < length) {
            output += Math.random().toString(36).slice(2);
        }
        return output.slice(0, length);
    }

    private _pad2(value: number): string {
        return `${value}`.padStart(2, "0");
    }

    private _isCanonicalUbuntuLtsLinuxImage(image: ImageInformation): boolean {
        const osType = (image && image.osType || "").toLowerCase();
        const publisher = (image && image.imageReference && image.imageReference.publisher || "").toLowerCase();
        const offer = (image && image.imageReference && image.imageReference.offer || "").toLowerCase();
        const sku = (image && image.imageReference && image.imageReference.sku || "").toLowerCase();

        const isUbuntu = offer.includes("ubuntu") || sku.includes("ubuntu");
        const isLts = offer.includes("lts") || sku.includes("lts");

        return osType === "linux"
            && publisher === "canonical"
            && isUbuntu
            && isLts;
    }

    private _isVerified(image: ImageInformation): boolean {
        return (image && image.verificationType || "").toLowerCase() === VerificationType.Verified;
    }

    private _isNearEol(image: ImageInformation): boolean {
        if (!(image && image.batchSupportEndOfLife)) {
            return false;
        }

        const eolDate = new Date(image.batchSupportEndOfLife);
        if (Number.isNaN(eolDate.getTime())) {
            return false;
        }

        const diffInDays = (eolDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return diffInDays <= MultiRegionPoolBootstrapService.nearEolDaysThreshold;
    }

    private _compareUbuntuCandidates(a: ImageInformation, b: ImageInformation): number {
        const versionDiff = this._ubuntuVersionScore(b) - this._ubuntuVersionScore(a);
        if (versionDiff !== 0) {
            return versionDiff;
        }

        const eolDiff = this._eolTimestampForSort(b) - this._eolTimestampForSort(a);
        if (eolDiff !== 0) {
            return eolDiff;
        }

        const aAgent = (a && a.nodeAgentSKUId) || "";
        const bAgent = (b && b.nodeAgentSKUId) || "";
        return aAgent.localeCompare(bAgent);
    }

    private _ubuntuVersionScore(image: ImageInformation): number {
        const text = [
            image && image.imageReference && image.imageReference.sku,
            image && image.imageReference && image.imageReference.offer,
            image && image.nodeAgentSKUId,
        ].join(" ").toLowerCase();
        const match = text.match(/(\d{2})[._-](\d{2})/);
        if (!match) {
            return -1;
        }
        return Number(match[1]) * 100 + Number(match[2]);
    }

    private _eolTimestampForSort(image: ImageInformation): number {
        if (!(image && image.batchSupportEndOfLife)) {
            return Number.MAX_SAFE_INTEGER;
        }
        const timestamp = new Date(image.batchSupportEndOfLife).getTime();
        return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
    }
}
