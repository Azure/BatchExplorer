import * as React from "react";
import { Route, Switch } from "react-router";
import { ButtonDemo } from "../demo/generic/button/button-demo";
import { ComboBoxDemo } from "../demo/generic/combobox/combobox-demo";
import { SearchBoxDemo } from "../demo/generic/searchbox/searchbox-demo";
import { QuotaDemo } from "../demo/batch/quota/quota-demo";
import { ResourcesDemo } from "../demo/batch/resources/resources-demo";
import { TabDemo } from "../demo/batch/tab/tab-demo";
import { ToolbarDemo } from "../demo/batch/toolbar/toolbar-demo";
import { CertificateDemo } from "../demo/displays/certificate/certificate-demo";
import { CreateItemDemo } from "../demo/displays/createitem/createitem-demo";
import { FileDemo } from "../demo/displays/file/file-demo";
import { JobSpecificationDemo } from "../demo/displays/jobspecification/jobspecification-demo";
import { NodesDemo } from "../demo/displays/nodes/nodes-demo";
import { PackagesDemo } from "../demo/displays/packages/packages-demo";
import { PoolGraphDemo } from "../demo/displays/poolgraph/poolgraph-demo";
import { TasksDemo } from "../demo/displays/tasks/tasks-demo";
import { TextFieldDemo } from "../demo/generic/textfield/textfield-demo";
import { CheckboxDemo } from "../demo/generic/checkbox/checkbox-demo";
import { SubscriptionsDemo } from "../demo/batch/subscriptions/subscriptions-demo";

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
            <Route path="/playground/searchbox">
                <SearchBoxDemo />
            </Route>
            <Route path="/playground/textfield">
                <TextFieldDemo />
            </Route>
            <Route path="/playground/quota">
                <QuotaDemo />
            </Route>
            <Route path="/playground/resources">
                <ResourcesDemo />
            </Route>
            <Route path="/playground/subscriptions">
                <SubscriptionsDemo />
            </Route>
            <Route path="/playground/tab">
                <TabDemo />
            </Route>
            <Route path="/playground/toolbar">
                <ToolbarDemo />
            </Route>
            <Route path="/playground/certificate">
                <CertificateDemo />
            </Route>
            <Route path="/playground/createitem">
                <CreateItemDemo />
            </Route>
            <Route path="/playground/file">
                <FileDemo />
            </Route>
            <Route path="/playground/poolgraph">
                <PoolGraphDemo />
            </Route>
            <Route path="/playground/jobspecification">
                <JobSpecificationDemo />
            </Route>
            <Route path="/playground/nodes">
                <NodesDemo />
            </Route>
            <Route path="/playground/packages">
                <PackagesDemo />
            </Route>
            <Route path="/playground/tasks">
                <TasksDemo />
            </Route>
        </Switch>
    );
};
