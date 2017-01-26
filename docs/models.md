# Writing a model

This is a documentation to help create models which are DataStructure that maps entities returned by apis.

All models should be immmutable using `immutable.Record` otherwise the `RxProxy` that is using immutable `List` and `Map` will not handle those correctly.
(Immutable.js will convert those to a Map automatically which then lose the ability to run `myModel.myAttr`)

If you are just making a model that is internal to a component:
* doesn't it really need to be shared with others
* if yes maybe just export from the component file/folder

### Step 1: Create file
Create model file `myNewModel.ts` in `app/models`
add this to `app/models/index.ts`

```typescript
export * from "./myNewModel"
```

### Step 2: Write the Record
Use this to specify default values for each input. This is quite useful for inputs which are array for example and prevent a null check later in the code
**It is important to have every input defined here otherwise they will be ignored**

```typescript
import { List, Record } from "immutable";

const FooRecord = Record({
    id: null,
    state: null,
    files: [],
    bar: null,
});
```

### Step 3: Write the model class

You'll need to redefine the inputs. This is for typing purposes.

```typescript
export class Foo extends FooRecord {
    public id: string;
    public state: string;
    public files: List<string>;
    public bar: Bar;
}
```

### Step 4(If applicable): created nested Record
In the case some of the attributes are other models(Record). Then you'll need to do the following to make sure they are initialized correctly


```typescript
// Add this constructor
constructor(data: any = {}) {
    super(Object.assign({}, data, {
        bar: data.bar && new Bar(data.ar),
    }));
}
```

