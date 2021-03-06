# Writting a component

Official documentation from angular <https://angular.io/docs/ts/latest/api/core/index/Component-decorator.html>

## Naming convention

1. Name the file in this format `do-something.component.ts`
2. Name the class inside `class DoSomethingComponent`
3. Name the compoennt selector `bl-do-something`
4. Name the template and the css file the same as the component `do-something.html` and `do-something.scss`

Note: Linting will complain if you don't follow the format for #2 and 3

## Component template

You can either have the template be inline(Only use this if the template is extremely simple - 3 lines max)

```typescript
@Component({
  ...
  template: "<div>Show something</div>"
});
```

Or in a sperated file. If so name the file with the same name as the component `do-something.html` in the same folder.

```typescript
@Component({
  ...
  templateUrl: "do-something.html" // Use templateUrl webpack has a plugin that handle this and setup hot reload
});
```

```html
<div>Show something</div>
```

## Style your component

Prefer use of the angular2 `styleUrls` attribute on the component decorator.
Add a style file in the same folder as your component(If the folder is getting to crowded maybe move each component in its own sub folder)

```ts
import "./do-something.scss";

@Component({
    ...
});
```

Then in `do-something.scss`

```scss
@import "app/styles/variables"; // Import variables

bl-do-something {
    .class1 {
        color: red;
    }
}

```

## Do something on input

Maybe unclear in the offical angular2 doc you have 2 options here, given the following input:

```typescript
@Input()
public task: Task;
```

1. Make the input a setter and add any code needed there

    ```typescript
    @Input()
    public set task(task: Task) {
      this._task = task;
      this.doSomething();
    }
    public get task() { return this._task; };

    private _task: Task;
    ```

2. Implement `OnChanges`

    ```typescript
    import { Component, Input, OnChanges } from "@angular/core"

    export class DoSomethingComponent implements OnChanges {
      @Input()
      public task: Task;

      public onChanges(inputs) {
        if(inputs.task) { // Means the input was changed
          this.doSomething();
        }
      }
    }
    ```

Option 2 is the best choice if you want to listen to multiple input (e.g. Both `job` and `task`) and in most case would make the code cleaner

## Change detection

You can make the component to only detect changes when one of the input is changed which will improve performance.
If possible try to design components stateless(i.e. depending only on the inputs), if a component is getting quite big maybe consider spliting it into multiple stateless components.

```typescript

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
})
```

**Testing On push components:**
Angular2 currently has a [bug/missing feature](https://github.com/angular/angular/issues/12313) where component won't be able to detect change if created directly.
The workaround is to create a TestComponent containing the compoennt you want to test.

```typescript
@Component({
    template: `<bl-do-something [task]="task"></bl-do-something>`,
})
class TestJobErrorDisplayComponent {
    public task: Task;
}

```

## Testing a component

Create a file named with the component name `do-something.component.spec.ts` in the `test/app` folder and following the same structure you have in the `app` folder.

**IMPORTANT: in `configureTestingModule` don't import any of our modules as it makes the test use a significant larger amount of memory and time.(For JobErrorDisplayComponent it is 10x slower) Just declare the component you want to test and mock others**
Here is a snippet of a test component test

```typescript

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { MyComp } from "app/components/path";

describe("MyComp", () => {
    let fixture: ComponentFixture<MyComp>;
    let component: MyComp;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [], // Declare components you'll be using as well as some mock component if needed
        });
        fixture = TestBed.createComponent(MyComp);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
```
