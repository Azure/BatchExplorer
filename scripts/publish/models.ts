export enum IssueState {
    open = "open",
    closed = "closed",
}

export interface Label {
    id: number;
    name: string;
    color: string;
}

export interface Issue {
    id: number;
    url: string;
    number: number;
    title: string;
    state: IssueState;
    html_url: string;
    labels: Label[];
    pull_request: any;
}

export interface MilestoneChangelog {
    milestone: Milestone;
    labels: string[];
    issues: { [key: string]: Issue[] };
}

export interface Milestone {
    id: number;
    number: number;
    title: string;
    url: string;
    state: IssueState;
    description: string;
    html_url: string;
}
