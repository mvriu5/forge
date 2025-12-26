import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { useSession } from "@/hooks/data/useSession"
import { queryOptions } from "@/lib/queryOptions"
import { Octokit } from "@octokit/rest"
import { useQuery } from "@tanstack/react-query"

const GITHUB_QUERY_KEY = (accessToken: string | null, name: string | undefined) => ["githubHeatmap", accessToken, name] as const

interface GitHubContribution {
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

interface ContributionsResponse {
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
}

async function getContributions(accessToken: string | null, username: string | undefined): Promise<GitHubContribution[]> {
    if (!accessToken || !username) return []

    const octokit = new Octokit({auth: accessToken})

    const to = new Date()
    const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate())

    const response = await octokit.graphql<ContributionsResponse>(CONTRIBUTIONS_QUERY, {
        username,
        from: from.toISOString(),
        to: to.toISOString(),
    })

    if (!response.user) throw new Error(`User ${username} not found.`)

    const contributions: GitHubContribution[] = []
    const weeks = response.user.contributionsCollection.contributionCalendar.weeks

    for (const week of weeks) {
        for (const day of week.contributionDays) {
            contributions.push({
                date: day.date,
                count: day.contributionCount,
            })
        }
    }

    return contributions
}

export const useGithubHeatmap = () => {
    const {userId, session} = useSession()
    const {integrations} = useIntegrations(userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")

    const {data, isLoading, isFetching, isError, refetch} = useQuery<GitHubContribution[], Error>(queryOptions({
        queryKey: GITHUB_QUERY_KEY(githubIntegration?.accessToken ?? null, session?.user?.name),
        queryFn: () => getContributions(githubIntegration?.accessToken ?? null, session?.user?.name),
        enabled: Boolean(githubIntegration?.accessToken),
    }))

    return {
        data: data ?? [],
        isLoading,
        isFetching,
        isError,
        refetch
    }
}
