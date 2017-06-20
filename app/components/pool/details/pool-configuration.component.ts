import { Component, Input } from "@angular/core";
import { List } from "immutable";

import { ApplicationPackageReference, CertificateReference, Metadata, Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";

@Component({
    selector: "bl-pool-configuration",
    templateUrl: "pool-configuration.html",
})
export class PoolConfigurationComponent {
    @Input()
    public set pool(value: Pool) {
        this._pool = value;
        this._refresh(this._pool);
    }
    public get pool() { return this._pool; }

    public decorator: PoolDecorator;
    public certificates: List<CertificateReference>;
    public appPackages: List<ApplicationPackageReference>;
    public metadata: List<Metadata> = List([]);

    private _pool: Pool;

    private _refresh(pool: Pool) {
        if (pool) {
            this.decorator = new PoolDecorator(this._pool);
            this.appPackages = this.decorator.applicationPackageReferences;
            this.certificates = this.decorator.certificateReferences;
            this.metadata = pool.metadata;
        }
    }
}
