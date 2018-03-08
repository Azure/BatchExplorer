# Set of custom tslint rules to run


## Rules

#### forbidden-imports

List of imports that are forbidden in a certain context
For example anything under @batch-flask cannot import anything from `app/` or `common/`


#### No Parent imports
Ban the import of a parent module.

For example in file `foo/bar/abc/file.txt`

```ts
// Bad
import { A } from "foo";
import { B } from "foo/bar";
import { C } from "foo/bar/abc";

// Good
import { A } from "foo/other";
import { B } from "foo/bar/other";
import { C } from "foo/bar/abc/other";
import { D } from "foo/bar/abc/other/sub";
```
