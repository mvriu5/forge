import {useQuery} from "@tanstack/react-query"
import {useSession, } from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"
import {Octokit} from "@octokit/rest"

const GITHUB_QUERY_KEY = (accessToken: string | null, name: string | undefined) => ["githubHeatmap", accessToken, name] as const

type GitHubContribution = {
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

async function getContributions(accessToken: string | null, username: string | undefined, fromDate?: Date, toDate?: Date): Promise<GitHubContribution[] | undefined> {
    if (!accessToken || !username) return undefined
    const octokit = new Octokit({auth: accessToken})

    const to = toDate ?? new Date()
    const from = fromDate ?? new Date(to.getFullYear() - 1, to.getMonth(), to.getDate())

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

    const contributions: GitHubContribution[] = []
    const weeks = response.user.contributionsCollection.contributionCalendar.weeks

    weeks.map((week) => {
        week.contributionDays.map((day) => {
            contributions.push({
                date: day.date,
                count: day.contributionCount,
            })
        })
    })

    return contributions
}

export const useGithubHeatmap = () => {
    const {session} = useSession()
    const userId = session?.user?.id
    const {integrations} = useIntegrations(userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: GITHUB_QUERY_KEY(githubIntegration?.accessToken ?? null, session?.user?.name),
        queryFn: () => getContributions(githubIntegration?.accessToken ?? null, session?.user?.name),
        enabled: Boolean(githubIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })

    return {
        data,
        isLoading,
        isFetching,
        isError,
        refetch
    }
}