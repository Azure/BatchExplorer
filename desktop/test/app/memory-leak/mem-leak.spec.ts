/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from "@angular/core";
import { TestBed, async } from "@angular/core/testing";
import { TaskDetailsModule } from "app/components/task/details";

export function main() {
    // eslint-disable-next-line
    fdescribe("Memory leak Testing", () => {
        for (let i = 0; i < 100000; i++) {
            describe(`${i}`, () => {
                beforeEach(async(() => {
                    TestBed.configureTestingModule({
                        imports: [TaskDetailsModule],
                        // imports: [BaseModule],
                        // imports: [
                        //     BrowserModule,
                        //     FormsModule,
                        //     MaterialModule,
                        //     DropdownModule,
                        //     NotificationModule,
                        // ],
                        declarations: [
                            TestBigComponent,
                            TestComponent,
                        ],
                    }).compileComponents();
                }));

                it(`should leak memory`, () => {
                    const fixture = TestBed.createComponent(TestComponent);
                    fixture.detectChanges();
                });
            });
        }

        for (let i = 0; i < 200; i++) {
            it(`cleanup ${i}`, () => {
                let a = 0;
                a++;
            });
        }
    });
}

// Uncomment below to focus the above tests
// main();

@Component({ selector: "bl-cmp", template: "<div></div>" })
class TestComponent { }

@Component({ selector: "bl-big", templateUrl: "./test-big-component.html" })
class TestBigComponent { }
