import { useRouteReadinessQuery } from '../graphql/generated';
import { useAppStore } from '../store';
import type { RouteReadinessQuery } from '../graphql/generated';

export type RouteReadinessData = RouteReadinessQuery['routeReadiness'];

export const useRouteReadiness = () => {
    const submittedRoute = useAppStore((s) => s.submittedRoute);

    const { data, loading, error } = useRouteReadinessQuery({
        variables: submittedRoute
            ? {
                startPlace: submittedRoute.startPlace.placeName,
                startEloc: submittedRoute.startPlace.eLoc,
                endPlace: submittedRoute.endPlace.placeName,
                endEloc: submittedRoute.endPlace.eLoc,
                bikeType: submittedRoute.bikeType,
            }
            : undefined,
        skip: !submittedRoute,
        fetchPolicy: 'cache-and-network',
    });

    return { data: data?.routeReadiness ?? null, loading, error };
};
