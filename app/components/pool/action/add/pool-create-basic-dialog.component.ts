import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "core-decorators";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { DynamicForm } from "app/core";
import { Pool } from "app/models";
import { PoolCreateDto } from "app/models/dtos";
import { createPoolToData, poolToFormModel } from "app/models/forms";
import { PoolService } from "app/services";

@Component({
    selector: "bl-pool-create-basic-dialog",
    templateUrl: "pool-create-basic-dialog.html",
})
export class PoolCreateBasicDialogComponent extends DynamicForm<Pool, PoolCreateDto> {
    public selectedOsConfiguration: string;
    public createPoolForm: FormGroup;

    public OS_CONFIGURATION_TYPES = {
        PaaS: "Windows PaaS",
        IaaS: "Gallery IaaS",
    };

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolCreateBasicDialogComponent>,
        private poolService: PoolService,
        private notificationService: NotificationService) {
        super(PoolCreateDto);

        this.selectedOsConfiguration = this.OS_CONFIGURATION_TYPES.PaaS;
        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(64),
                Validators.pattern("^[\\w\\_-]+$"),
            ]],
            displayName: "",
            targetDedicated: [0, Validators.required],
            os: [{}, Validators.required],
            vmSize: ["standard_d1", Validators.required],
            maxTasksPerNode: 1,
            enableInterNodeCommunication: false,
        });
    }

    @autobind()
    public submit(): Observable<any> {
        const id = this.form.value.id;
        const data = this.getCurrentValue();
        const obs = this.poolService.add(data);
        obs.do(() => {
            this.poolService.onPoolAdded.next(id);
            this.notificationService.success("Pool added!", `Pool '${id}' was created successfully!`);
        });

        return obs;
    }

    public get vmSizes() {
        return this.getVmSizes();
    }

    public dtoToForm(pool: PoolCreateDto) {
        return poolToFormModel(pool);
    }

    public formToDto(data: any): PoolCreateDto {
        return createPoolToData(data);
    }

    // TODO: Make this into it's own component
    private getVmSizes() {
        // TODO: Use https://msdn.microsoft.com/en-us/library/azure/dn469422.aspx
        let sizes = [
            "standard_d1",
            "standard_d2",
            "standard_d3",
            "standard_d4",
            "standard_d11",
            "standard_d12",
            "standard_d13",
            "standard_d14",
        ];

        return sizes;
    }
}
