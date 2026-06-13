import { gql } from '@apollo/client';

export const ROUTE_READINESS_QUERY = gql`
  query RouteReadiness($startPlace: String!, $endPlace: String!, $bikeType: BikeType) {
    routeReadiness(startPlace: $startPlace, endPlace: $endPlace, bikeType: $bikeType) {
      overallStatus
      summary
      weather { score note }
      hazards { score note }
      traffic { score note }
      hazardReports { id hazardType severity lat lng description reportedAt }
      suggestedBikeType { bikeType reason }
      routeGeometry
      pointsOfInterest { name type lat lng rating reason }
    }
  }
`;