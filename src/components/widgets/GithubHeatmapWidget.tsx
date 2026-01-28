"use client"

import { Heatmap } from "@/components/ui/Heatmap"
import { Skeleton } from "@/components/ui/Skeleton"
import { WidgetContent } from "@/components/widgets/base/WidgetContent"
import { useBreakpoint } from "@/hooks/media/useBreakpoint"
import { WidgetProps } from "@/lib/definitions"
import { defineWidget } from "@/lib/widget"
import React from "react"
import { getIntegrationByProvider, useIntegrations } from "@/hooks/data/useIntegrations"
import { queryOptions } from "@/lib/queryOptions"
import { Octokit } from "@octokit/rest"
import { useQuery } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"

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


const SKELETON_COUNT = 371
const skeletonKeys = Array.from({ length: SKELETON_COUNT }, (_, i) => `sk-${i}`)

const GithubHeatmapWidget: React.FC<WidgetProps> = ({ widget }) => {
    const {data: session} = authClient.useSession()
    const {integrations} = useIntegrations(widget.userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")

    const {data, isLoading, isFetching} = useQuery<GitHubContribution[], Error>(queryOptions({
        queryKey: GITHUB_QUERY_KEY(githubIntegration?.accessToken ?? null, session?.user?.name),
        queryFn: () => getContributions(githubIntegration?.accessToken ?? null, session?.user?.name),
        enabled: Boolean(githubIntegration?.accessToken),
    }))

    const {tailwindBreakpoint} = useBreakpoint()

    const cellSize = {
        "2xl": 10,
        xl: 8,
        lg: 7,
        md: 4,
        sm: 6,
        xs: 5
    }

    const contributions = data?.map(({ date, count }) => ({ date, count }))

    return (
        <>
            <WidgetContent className={"h-full flex justify-center items-center"}>
                {(isLoading || isFetching) ? (
                    <div
                        className="grid mt-6"
                        style={{
                            gridTemplateColumns: "repeat(53, 10px)",
                            gridTemplateRows: "repeat(7, 10px)",
                            gap: "2px",
                        }}
                    >
                        {skeletonKeys.map((key) => (
                            <Skeleton key={key} className={"size-2.5 rounded-xs"}/>
                        ))}
                    </div>
                ) : (
                    <Heatmap
                        data={contributions}
                        cellSize={cellSize[tailwindBreakpoint]}
                        gap={2}
                    />
                )}
            </WidgetContent>
        </>
    )
}

export const githubheatmapWidgetDefinition = defineWidget({
    name: "Github Heatmap",
    integration: "github",
    component: GithubHeatmapWidget,
    description: "Show off your commit streak.",
    image: "/githubheatmap_preview.svg",
    tags: ["github"],
    sizes: {
        desktop: { width: 2, height: 1 },
        tablet: { width: 1, height: 1 },
        mobile: { width: 1, height: 1 }
    }
})
