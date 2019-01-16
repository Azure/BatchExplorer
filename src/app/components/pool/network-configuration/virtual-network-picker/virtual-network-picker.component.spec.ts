import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SelectComponent, SelectModule } from "@batch-flask/ui";
import { ArmBatchAccount, LocalBatchAccount, Subscription } from "app/models";
import { BatchAccountService, NetworkConfigurationService, VirtualNetwork } from "app/services";
import { BehaviorSubject, of } from "rxjs";
import { VirtualNetworkPickerComponent } from "./virtual-network-picker.component";

@Component({
    template: `
        <bl-virtual-network-picker [formControl]="control" [armNetworkOnly]="armNetworkOnly">
        </bl-virtual-network-picker>
    `,
})
class TestComponent {
    public armNetworkOnly = false;
    public control = new FormControl(null);
}

const sub1 = new Subscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const network1: VirtualNetwork = {
    id: "/subscriptions/sub1/virtualnetworks/net-1",
    name: "net-1",
    location: "westus",
    category: "ARM",
    subnets: [
        { id: "/subscriptions/sub1/virtualnetworks/net-1/default", name: "default" },
        { id: "/subscriptions/sub1/virtualnetworks/net-1/custom", name: "custom" },
    ],
};

const network2: VirtualNetwork = {
    id: "/subscriptions/sub1/virtualnetworks/net-2",
    name: "net-2",
    location: "westus",
    category: "ARM",
    subnets: [
        { id: "/subscriptions/sub1/virtualnetworks/net-2/default", name: "default" },
    ],
};

const network3: VirtualNetwork = {
    id: "/subscriptions/sub1/virtualnetworks/net-3",
    name: "net-3",
    location: "westus",
    category: "Classic",
    subnets: [
        { id: "/subscriptions/sub1/virtualnetworks/net-3/default", name: "default" },
    ],
};

describe("VirtualNetworkPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let networkEl: DebugElement;
    let networkSelect: SelectComponent;
    let subnetSelect: SelectComponent;

    let accountServiceSpy;
    let networkServiceSpy;

    beforeEach(() => {

        accountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: "/subs/sub-1/batchaccounts/acc-1",
                name: "acc-1",
                location: "westus",
                properties: {} as any,
                subscription: sub1,
            })),
        };

        networkServiceSpy = {
            listArmVirtualNetworks: jasmine.createSpy("listArmVirtualNetworks").and.returnValue(of([
                network1,
                network2,
            ])),
            listClassicVirtualNetworks: jasmine.createSpy("listClassicVirtualNetworks").and.returnValue(of([network3])),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, SelectModule, I18nTestingModule],
            declarations: [VirtualNetworkPickerComponent, TestComponent],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: NetworkConfigurationService, useValue: networkServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-virtual-network-picker"));
        fixture.detectChanges();

        networkEl = de.query(By.css("bl-select.network"));
        networkSelect = networkEl && networkEl.componentInstance;
        subnetSelect = de.query(By.css("bl-select.subnet")).componentInstance;
    });

    it("network default to None", () => {
        expect(networkEl.nativeElement.textContent).toContain("common.none");
        expect(networkSelect.value).toEqual(null);
    });

    it("Shows message when account is not arm account", () => {
        accountServiceSpy.currentAccount.next(new LocalBatchAccount({ name: "foo" }));
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toContain("virtual-network-picker.notArm");
        expect(de.query(By.css("bl-select.network"))).toBeFalsy();
        expect(de.query(By.css("bl-select.subnet"))).toBeFalsy();
    });

    it("shows all options", () => {
        const options = networkSelect.options.toArray();
        expect(options.length).toEqual(4); // 3 networks + none
        expect(options[0].value).toEqual(null);
        expect(options[0].label).toEqual("common.none");

        expect(options[1].value).toEqual(network1.id);
        expect(options[1].label).toEqual("(ARM) net-1");

        expect(options[2].value).toEqual(network2.id);
        expect(options[2].label).toEqual("(ARM) net-2");

        expect(options[3].value).toEqual(network3.id);
        expect(options[3].label).toEqual("(Classic) net-3");
    });

    it("shows only ARM networks when armNetworkOnly is true", () => {
        testComponent.armNetworkOnly = true;
        fixture.detectChanges();

        const options = networkSelect.options.toArray();
        expect(options.length).toEqual(3); // 2 ARM networks + none
        expect(options[0].value).toEqual(null);
        expect(options[0].label).toEqual("common.none");

        expect(options[1].value).toEqual(network1.id);
        expect(options[1].label).toEqual("(ARM) net-1");

        expect(options[2].value).toEqual(network2.id);
        expect(options[2].label).toEqual("(ARM) net-2");
    });

    describe("when slecting a network", () => {
        beforeEach(() => {
            networkSelect.selectOption(networkSelect.options.toArray()[1]);
            fixture.detectChanges();
        });

        it("shows the corresponding subnet", () => {
            const options = subnetSelect.options.toArray();
            expect(options.length).toEqual(2); // 2 ARM networks + none
            expect(options[0].value).toEqual(network1.subnets[0].id);
            expect(options[0].label).toEqual(network1.subnets[0].name);

            expect(options[1].value).toEqual(network1.subnets[1].id);
            expect(options[1].label).toEqual(network1.subnets[1].name);
        });

        it("select the first subnet automatically", () => {
            expect(testComponent.control.value).toEqual(network1.subnets[0].id);
        });

        it("propagate changes when selecting subnet", () => {
            subnetSelect.selectOption(subnetSelect.options.toArray()[1]);
            fixture.detectChanges();

            expect(testComponent.control.value).toEqual(network1.subnets[1].id);
        });
    });
});
