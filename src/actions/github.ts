import { Octokit } from "@octokit/rest"

async function fetchPaginated<T>(fetchFunction: (page: number) => Promise<{ data: T[] }>, perPage = 100): Promise<T[]> {
    const results: T[] = []
    let page = 1

    while (true) {
        const response = await fetchFunction(page)
        const data = response.data
        results.push(...data)
        if (data.length < perPage) break
        page++
    }
    return results
}

export async function getAllRepos(accessToken: string):  Promise<{ repos: any[], octokit: Octokit | null }> {
    const repos: any[] = []

    const octokit = new Octokit({
        auth: accessToken,
    })

    const userRepos = await fetchPaginated((page) =>
        octokit.repos.listForAuthenticatedUser({per_page: 100, page})
    )
    repos.push(...userRepos)

    const orgsResponse = await octokit.orgs.listForAuthenticatedUser()
    const orgs = orgsResponse.data

    const orgReposPromises = orgs.map((org) =>
        fetchPaginated((page) =>
            octokit.repos.listForOrg({org: org.login, per_page: 100, page})
        )
    )
    const orgReposList = await Promise.all(orgReposPromises)
    orgReposList.map((orgRepos) => repos.push(...orgRepos))

    return {repos, octokit}
}

export async function fetchOpenIssuesAndPullsFromAllRepos(userId: string) {
    const {repos, octokit} = await getAllRepos(userId)
    if (!octokit) return

    const allIssues: any[] = []
    const allPullRequests: any[] = []

    const user = await octokit.request('GET /user', {
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    if (!user.data) return null

    for (const repo of repos) {
        let page = 1
        let issues: any[]

        do {
            issues = (await octokit.issues.listForRepo({
                owner: repo.owner.login,
                repo: repo.name,
                state: "open",
                per_page: 100,
                page,
            })).data

            const pulls = issues.filter(issue => issue.pull_request !== undefined &&
                (issue.assignees.some((a: any) => a.login === user.data.login) || issue.assignee?.login === user.data.login))
            const issuesOnly = issues.filter(issue => issue.pull_request === undefined &&
                (issue.assignees.some((a: any) => a.login === user.data.login) || issue.assignee?.login === user.data.login))

            allIssues.push(...issuesOnly)
            allPullRequests.push(...pulls)

            page++
        } while (issues.length === 100)
    }

    return {allIssues, allPullRequests}
}
