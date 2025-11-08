import {useQuery} from "@tanstack/react-query"
import {getContributions} from "@/actions/github"
import {useSession, } from "@/hooks/data/useSession"
import {getIntegrationByProvider, useIntegrations} from "@/hooks/data/useIntegrations"

export const useGithubHeatmap = () => {
    const {session} = useSession()
    const userId = session?.user?.id
    const {integrations} = useIntegrations(userId)
    const githubIntegration = getIntegrationByProvider(integrations, "github")

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: ["githubHeatmap", githubIntegration?.accessToken, session?.user?.name],
        queryFn: async () => {
            if (!githubIntegration?.accessToken || !session?.user?.name) throw new Error("Missing GitHub token")
            return await getContributions(githubIntegration.accessToken, session?.user?.name)
        },
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