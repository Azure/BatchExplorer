import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { TelemetryService } from "@batch-flask/core";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import {
    ActivityService, DialogService, FileSystemService, NotificationService, WorkspaceService,
} from "@batch-flask/ui";
import { FocusSectionModule } from "@batch-flask/ui/focus-section";
import { ServerErrorModule } from "@batch-flask/ui/server-error";
import { QuickListTestingModule, TableTestingModule } from "@batch-flask/ui/testing";
import { Certificate } from "app/models";
import { CertificateService, PinnedEntityService } from "app/services";
import { of } from "rxjs";
import { MockListView } from "test/utils/mocks";
import { CertificateListComponent } from "./certificate-list.component";

@Component({
    template: `<bl-certificate-list [quicklist]="quicklist"></bl-certificate-list>`,
})
class TestComponent {
    public quicklist = true;
}

const cert1 = new Certificate({ thumbprint: "abdefhi" });
const cert2 = new Certificate({ thumbprint: "aoiwghawo" });
const cert3 = new Certificate({ thumbprint: "dfeigheig" });

describe("CertificateListComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let mockCertificateService;

    beforeEach(() => {
        mockCertificateService = {
            listView: () => new MockListView(Certificate, {
                items: [cert1, cert2, cert3],
            }),
            onCertificateAdded: of(null),
        };
        TestBed.configureTestingModule({
            imports: [
                QuickListTestingModule,
                TableTestingModule,
                RouterTestingModule,
                FocusSectionModule,
                ServerErrorModule,
                ElectronTestingModule,
            ],
            declarations: [CertificateListComponent, TestComponent],
            providers: [
                { provide: CertificateService, useValue: mockCertificateService },
                { provide: FileSystemService, useValue: null },
                { provide: PinnedEntityService, useValue: null },
                { provide: NotificationService, useValue: null },
                { provide: DialogService, useValue: null },
                { provide: ActivityService, useValue: null },
                { provide: WorkspaceService, useValue: null },
                { provide: TelemetryService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-certificate-list"));
        fixture.detectChanges();
    });

    describe("when displaying quicklist", () => {

        it("it list all certificates", () => {
            const quicklist = de.query(By.css("bl-quick-list")).componentInstance;

            expect(quicklist.items.map(x => x.toJS())).toEqual([cert1.toJS(), cert2.toJS(), cert3.toJS()]);
        });
    });

    describe("when displaying table", () => {
        beforeEach(() => {
            testComponent.quicklist = false;
            fixture.detectChanges();
        });

        it("it list all certificates", () => {
            const table = de.query(By.css("bl-table")).componentInstance;
            expect(table.items.map(x => x.toJS())).toEqual([cert1.toJS(), cert2.toJS(), cert3.toJS()]);
        });
    });
});
