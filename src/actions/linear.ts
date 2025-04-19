"use server"

import {LinearClient} from "@linear/sdk"

export type LinearIssue = {
    id: string
    title: string
    description?: string
    stateName: string | undefined
    labels: Array<{ name: string, color?: string }>
    priority: number
    priorityName: string
    url: string
    project: string | undefined
    team: string |undefined
    createdAt: string
    updatedAt: string
}

export async function fetchLinearIssues(accessToken: string): Promise<LinearIssue[]> {
    const client = new LinearClient({accessToken: accessToken})
    const user = await client.viewer;
    const issues = await user.assignedIssues();

    return await Promise.all(
        issues.nodes.map(async (issue) => {
            const [ stateObj, projectObj, teamObj, labelsConn ] = await Promise.all([
                issue.state,
                issue.project,
                issue.team,
                issue.labels()
            ])

            const labels = labelsConn?.nodes.map(label => ({
                name:  label.name,
                color: label.color
            })) ?? []

            return {
                id: issue.id,
                title: issue.title,
                description: issue.description,
                stateName: stateObj?.name,
                labels: labels,
                priority: issue.priority,
                priorityName: issue.priorityLabel,
                url: issue.url,
                project: projectObj?.name,
                team: teamObj?.name,
                createdAt: issue.createdAt.toString(),
                updatedAt: issue.updatedAt.toString(),
            } satisfies LinearIssue
        })
    )
}
