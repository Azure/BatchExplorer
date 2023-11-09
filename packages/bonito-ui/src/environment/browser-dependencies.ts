import { DependencyFactories } from "@azure/bonito-core/lib/environment";
import { FormControlResolver, FormLayoutProvider } from "../components/form";

export enum BrowserDependencyName {
    FormControlResolver = "formControlResolver",
    FormLayoutProvider = "formLayoutProvider",
}

export interface BrowserDependencyFactories extends DependencyFactories {
    [BrowserDependencyName.FormControlResolver]: () => FormControlResolver;
    [BrowserDependencyName.FormLayoutProvider]: () => FormLayoutProvider;
}
