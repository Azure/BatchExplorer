# Coding styles

General guidelines on how to code for this probject

## Libraries

Those will be run automatically by the CI and if any error is found will fail the build.

* `eslint` for TypeScript linting. Install the ESLint extension for live warnings.
* `stylelint` for scss. With vscode install the stylelint extension to have live warning.

## Other

### Imports

Use 2 group for import(TSLint will then make sure they are sorted alpha in each group):

  1. For npm import
  2. For local import

e.g.

```typescript
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { autobind } from "@batch-flask/core";
import { Observable } from "rxjs";

import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";

// Code goes here
```

### Relative import

Try to use absolute import whenever possible(From the root of the project - start with `"app/...")
Only use a relative import for

```typescript
// Good
import {Some} from "app/components/folder/file"
import {Some} from "./file"
import {Some} from "./folder/file"

// Ok
import {Some} from "../folder/file"

// Bad
import {Some} from "../../folder/file"
import {Some} from "../../../folder/file"
```

### Component template

Use `templateUrl: "abc.html"` instead of `template: require("abc.html")`.
Try to only use `template: "<inline-template></inline-template>"` for simple templates.
