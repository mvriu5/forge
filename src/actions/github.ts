"use server"

import { Octokit } from "@octokit/rest"

async function fetchPaginated<T>(fetchFunction: (page: number) => Promise<{ data: T[] }>, perPage = 100): Promise<T[]> {
    const all: T[] = []
    let page = 1

    while (true) {
        const response = await fetchFunction(page)
        all.push(...response.data)
        if (response.data.length < perPage) break
        page++
    }
    return all
}


export async function getAllRepos(accessToken: string):  Promise<{ repos: any[], octokit: Octokit | null }> {
    const octokit = new Octokit({ auth: accessToken})

    const [userRepos, orgsResponse] = await Promise.all([
        fetchPaginated(page => octokit.repos.listForAuthenticatedUser({ per_page: 100, page })),
        octokit.orgs.listForAuthenticatedUser()])

    const orgReposLists = await Promise.all(
        orgsResponse.data.map(org => fetchPaginated(page => octokit.repos.listForOrg({ org: org.login, per_page: 100, page }))))

    const allRepos = [...userRepos, ...orgReposLists.flat()]
    const repos = Array.from(new Map(allRepos.map(repo => [repo.id, repo])).values())

    return { repos, octokit }
}

export async function fetchOpenIssuesAndPullsFromAllRepos(userId: string) {
    const {repos, octokit} = await getAllRepos(userId)
    if (!octokit) return

    const userResponse = await octokit.request("GET /user", {
        headers: { 'X-GitHub-Api-Version': '2022-11-28' }
    })

    const login = userResponse.data.login

    const tasks = repos.map(repo =>
        fetchPaginated(page =>
            octokit.issues.listForRepo({
                owner: repo.owner.login,
                repo: repo.name,
                state: "open",
                per_page: 100,
                page,
            })
        ).then(items => {
            const issues = items
                .filter(i => !i.pull_request)
                .filter(i => i.assignees?.some(a => a.login === login) || i.assignee?.login === login)
            const pulls = items
                .filter(i => !!i.pull_request)
                .filter(i => i.assignees?.some(a => a.login === login) || i.assignee?.login === login)

            return { issues, pulls }
        })
    );

    const results = await Promise.all(tasks);

    const allIssues = results.flatMap(r => r.issues);
    const allPullRequests = results.flatMap(r => r.pulls);

    return {allIssues, allPullRequests}
}
