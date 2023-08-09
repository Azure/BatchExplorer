import { BrowserDependencyFactories } from "@azure/bonito-ui/lib/environment";
import { BatchDependencyFactories } from "@batch/ui-service/lib/environment";

export type BatchBrowserDependencyFactories = BrowserDependencyFactories &
    BatchDependencyFactories;
