# Writing a model

This is a documentation to help create models which are DataStructure that maps entities returned by apis.

All models should be immmutable using the record api defined in `@batch-flask/core`.

Note: Before writting a model double check this is the best option:

* Models should be for containg data returned from remote APIs.
* Models are immutable which means it should not be for a structure containing user edit.
* Don't use models for internal data structure.(For a component or a small set of components)

## Step 1: Create file

Create model file `my-new-model.ts` in `app/models`
add this to `app/models/index.ts`

```typescript
export * from "./my-model"
```

Then you should be able to have

```typescript
// Good
import { MyNewModel } from "app/models"

// Bad
import { MyNewModel } from "app/models/myNewModel"
```

## Step 2: Write the attribute interface

In this interface define all the attributes of the model
This may look like we are creating a lot of duplicate code here but it makes it worth it when using the model later as you'll have typing when creating a new model.

```typescript
import { Partial } from "app/utils"

export interface MyModelAttributes {
    id: string;
    state: string;
    files: Partial<BarAttributes>[];
    bar: Partial<BarAttributes>
}

```

### Step 3: Write the model class

You need to do the following for the class:

* Decorate the class with the `@Model` decorator
* Extend the class with the `Record` class
* Decorate all attributes of the model with `@Prop` and all list attributes with `@ListProp`. Note: `@Prop` will be able to get the type of a nested model automatically. However you need to pass the type of the model in the list decorator.
* For default values just set the value in the class body `@Prop public a: string = "abc"`

```typescript
import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { Bar, BarAttributes } from "./bar"

@Model()
export class MyModel extends Record<MyModelAttributes> {
    @Prop()
    public id: string = "default-value";
    @Prop()
    public state: string;
    @Prop()
    public bar: Bar;

    @ListProp(Bar)
    public files: List<Bar>;
}
```

The record api will make all attributes with `@Prop` immutable. If you have a nested object it will automatically create it. And when using `@ListProp` it will automatically create a immutable list of items.
