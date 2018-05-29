export const githubEndpoint = "https://api.github.com";

export function repoUrl(repo: string) {
    return `${githubEndpoint}/repos/${repo}`;
}

export function issuesUrl(repo: string) {
    return `${repoUrl(repo)}/issues`;
}

export function pullRequestsUrl(repo: string) {
    return `${repoUrl(repo)}/pulls`;
}

export function issueUrl(repo: string, issueId: number) {
    return `${repoUrl(repo)}/issues/${issueId}`;
}

export function milestonesUrl(repo: string) {
    return `${repoUrl(repo)}/milestones`;
}

export function milestoneUrl(repo: string, milestone: number) {
    return `${repoUrl(repo)}/milestones/${milestone}`;
}

export function milestoneIssuesUrl(repo: string, milestone: string | number) {
    const query = `milestone=${milestone}&state=all&per_page=1000`;
    return `${issuesUrl(repo)}?${query}`;
}
