import { useRouteReadinessQuery } from '../graphql/generated';
import { useAppStore } from '../store';
import type { BikeType, RouteReadinessQuery } from '../graphql/generated';

export type RouteReadinessData = RouteReadinessQuery['routeReadiness'];

export const useRouteReadiness = () => {
    const plannedRoute = useAppStore((s) => s.plannedRoute);

    const { data, loading, error } = useRouteReadinessQuery({
        variables: plannedRoute
            ? {
                startPlace: plannedRoute.startPlace?.placeName ?? '',
                startEloc: plannedRoute.startPlace?.eLoc ?? '',
                endPlace: plannedRoute.endPlace?.placeName ?? '',
                endEloc: plannedRoute.endPlace?.eLoc ?? '',
                bikeType: (plannedRoute.bikeType as BikeType) || undefined,
            }
            : undefined,
        skip: !plannedRoute?.startPlace?.eLoc || !plannedRoute?.endPlace?.eLoc,
        fetchPolicy: 'cache-and-network',
    });

    return { data: data?.routeReadiness ?? null, loading, error };
};