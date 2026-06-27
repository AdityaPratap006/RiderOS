import { gql } from '@apollo/client';

export const ROUTE_READINESS_QUERY = gql`
  query RouteReadiness($startPlace: String!, $startEloc: String!, $endPlace: String!, $endEloc: String!, $bikeType: BikeType) {
    routeReadiness(startPlace: $startPlace, startEloc: $startEloc, endPlace: $endPlace, endEloc: $endEloc, bikeType: $bikeType) {
      overallStatus
      summary
      weather { score note }
      hazards { score note }
      traffic { score note }
      hazardReports { id hazardType severity lat lng description reportedAt }
      suggestedBikes { bikeType reason }
      bikeFitAnalysis { fit score note }
      routeGeometry
      pointsOfInterest { name type lat lng rating reason }
    }
  }
`;

export const PLACE_AUTOCOMPLETE_QUERY = gql`
  query PlaceAutocomplete($input: String!) {
    placeAutocomplete(input: $input) {
      placeName
      placeAddress
      eLoc
    }
  }
`;