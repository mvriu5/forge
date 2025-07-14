import {useIntegrationStore} from "@/store/integrationStore"
import {useQuery} from "@tanstack/react-query"
import {getContributions} from "@/actions/github"

export const useGithubHeatmap = () => {
    const { githubIntegration } = useIntegrationStore()

    const {data, isLoading, isFetching, isError, refetch} = useQuery({
        queryKey: ["githubHeatmap", githubIntegration?.accessToken],
        queryFn: async () => await getContributions(githubIntegration?.accessToken!, "mvriu5"),
        enabled: Boolean(githubIntegration?.accessToken),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000 // 5 minutes
    })

    return {
        data,
        isLoading,
        isFetching,
        isError,
        refetch
    }
}