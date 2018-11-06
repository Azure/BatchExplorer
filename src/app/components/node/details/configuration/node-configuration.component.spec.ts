import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import {
    BoolPropertyComponent, ClipboardService, I18nUIModule, TextPropertyComponent,
} from "@batch-flask/ui";
import { TimespanComponent } from "@batch-flask/ui/timespan";
import { Node, NodeState, Pool } from "app/models";
import { NodeConnectService } from "app/services";
import { of } from "rxjs";
import { NodeConfigurationComponent } from "./node-configuration.component";

const pool1 = new Pool({
    id: "pool-1",
    targetDedicatedNodes: 3,
    virtualMachineConfiguration: {
        imageReference: {
            publisher: "Cannonical",
            offer: "Ubuntu",
            sku: "16",
            virtualMachineImageId: null,
        },
        nodeAgentSKUId: "ubuntu",
    },
});
const node1 = new Node({ id: "node-1", state: NodeState.idle });

@Component({
    template: `<bl-node-configuration [pool]="pool" [node]="node"></bl-node-configuration>`,
})
class TestComponent {
    public pool = pool1;
    public node = node1;
}

describe("NodeConfigurationComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let nodeConnectServiceSpy;

    beforeEach(() => {
        nodeConnectServiceSpy = {
            getConnectionSettings: jasmine.createSpy("getConnectionSettings").and.returnValue(of({
                ip: "1.2.3.4",
            })),
        };
        TestBed.configureTestingModule({
            imports: [I18nTestingModule, I18nUIModule],
            declarations: [
                NodeConfigurationComponent, TestComponent,
                TimespanComponent, TextPropertyComponent, BoolPropertyComponent,
            ],
            providers: [
                { provide: NodeConnectService, useValue: nodeConnectServiceSpy },
                { provide: ClipboardService, useValue: null },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-node-configuration"));
        fixture.detectChanges();
    });

    describe("External ip", () => {
        it("display the ip", () => {
            expect(de.nativeElement.textContent).toContain("1.2.3.4");
        });

        it("doesn't call getConnectionSettings unless node id or pool id changes", () => {
            expect(nodeConnectServiceSpy.getConnectionSettings).toHaveBeenCalledTimes(1);

            testComponent.node = new Node({ id: "node-1", state: NodeState.running });
            fixture.detectChanges();
            // Should not get called here
            expect(nodeConnectServiceSpy.getConnectionSettings).toHaveBeenCalledTimes(1);

            testComponent.node = new Node({ id: "node-34", state: NodeState.idle });
            fixture.detectChanges();
            // Should not get called here
            expect(nodeConnectServiceSpy.getConnectionSettings).toHaveBeenCalledTimes(2);
        });
    });
});
