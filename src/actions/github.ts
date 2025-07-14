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

export async function fetchOpenIssuesAndPullsFromAllRepos(accessToken: string) {
    const {repos, octokit} = await getAllRepos(accessToken)
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

export interface GitHubContribution {
    date: string
    count: number
}

const CONTRIBUTIONS_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

export async function getContributions(accessToken: string, username: string, fromDate?: Date, toDate?: Date): Promise<GitHubContribution[]> {
    try {
        const octokit = new Octokit({ auth: accessToken})

        const to = toDate || new Date()
        const from = fromDate || new Date(to.getFullYear() - 1, to.getMonth(), to.getDate())

        const response = await octokit.graphql<{
            user: {
                contributionsCollection: {
                    contributionCalendar: {
                        weeks: Array<{
                            contributionDays: Array<{
                                date: string
                                contributionCount: number
                            }>
                        }>
                    }
                }
            }
        }>(CONTRIBUTIONS_QUERY, {
            username,
            from: from.toISOString(),
            to: to.toISOString(),
        })

        if (!response.user) throw new Error(`Benutzer ${username} nicht gefunden`)

        console.log(response)
        const contributions: GitHubContribution[] = []
        const weeks = response.user.contributionsCollection.contributionCalendar.weeks

        weeks.map((week) => {
            week.contributionDays.map((day) => {
                contributions.push({
                    date: day.date,
                    count: day.contributionCount
                })
            })
        })

        return contributions

    } catch (error) {
        console.error("Fehler beim Laden der GitHub-Daten:", error)
        throw error
    }
}