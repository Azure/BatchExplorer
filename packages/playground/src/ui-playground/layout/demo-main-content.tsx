import * as React from "react";
import { Route, Switch } from "react-router";
import { ButtonDemo } from "../demo/form/button/button-demo";
import { ComboBoxDemo } from "../demo/form/combobox/combobox-demo";
import { SearchBoxDemo } from "../demo/form/searchbox/searchbox-demo";
import { TextFieldDemo } from "../demo/form/textfield/textfield-demo";
import { CheckboxDemo } from "../demo/form/checkbox/checkbox-demo";
import { CertificateDisplayDemo } from "../demo/display/certificate/certificate-display-demo";
import { DropdownDemo } from "../demo/form/dropdown-demo";

export const DemoMainContent: React.FC = () => {
    return (
        <Switch>
            <Route path="/playground/button">
                <ButtonDemo />
            </Route>
            <Route path="/playground/checkbox">
                <CheckboxDemo />
            </Route>
            <Route path="/playground/combobox">
                <ComboBoxDemo />
            </Route>
            <Route path="/playground/dropdown">
                <DropdownDemo />
            </Route>
            <Route path="/playground/searchbox">
                <SearchBoxDemo />
            </Route>
            <Route path="/playground/textfield">
                <TextFieldDemo />
            </Route>
            <Route path="/playground/displays/certificate">
                <CertificateDisplayDemo />
            </Route>
        </Switch>
    );
};
