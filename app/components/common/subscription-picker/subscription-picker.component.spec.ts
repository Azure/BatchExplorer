import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { SelectComponent, SelectModule } from "@batch-flask/ui";
import { FormModule } from "@batch-flask/ui/form";
import { Subscription } from "app/models";
import { SubscriptionService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { SubscriptionPickerComponent } from "./subscription-picker.component";

@Component({
    template: `<bl-subscription-picker [formControl]="subscription"></bl-subscription-picker>`,
})
class TestComponent {
    public subscription = new FormControl(null);
}

const sub1 = new Subscription({ id: "subs/sub-1", subscriptionId: "sub-1", displayName: "Sub 1" });
const sub2 = new Subscription({ id: "subs/sub-2", subscriptionId: "sub-2", displayName: "Sub 2" });
const sub3 = new Subscription({ id: "subs/sub-3", subscriptionId: "sub-3", displayName: "Sub 3" });
const subscriptions = [sub1, sub2, sub3];

describe("SubscriptionPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let select: SelectComponent;
    let subscriptionServiceSpy;

    beforeEach(() => {
        subscriptionServiceSpy = {
            subscriptions: new BehaviorSubject(List(subscriptions)),
        };
        TestBed.configureTestingModule({
            imports: [SelectModule, FormsModule, ReactiveFormsModule, FormModule],
            declarations: [SubscriptionPickerComponent, TestComponent],
            providers: [
                { provide: SubscriptionService, useValue: subscriptionServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-subscription-picker"));
        fixture.detectChanges();
        select = de.query(By.css("bl-select")).componentInstance;
    });

    it("list all subscriptions in select", () => {
        expect(select.options.length).toBe(3);
    });

    it("selecting a subscription propagate", () => {
        const options = select.options.toArray();
        select.selectOption(options[1]);
        fixture.detectChanges();
        expect(testComponent.subscription.value).toEqual(sub2);
    });

    it("select the subscription", () => {
        testComponent.subscription.setValue(sub3);
        fixture.detectChanges();
        expect(select.selected.size).toBe(1);
        expect([...select.selected].first()).toEqual(sub3.id);
    });
});
