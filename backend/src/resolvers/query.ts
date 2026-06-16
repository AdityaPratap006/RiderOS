import { supabase } from '../db/supabase';
import { getPlaceAutocompleteSuggestions } from '../services/placeAutocompleteService';
import { getRouteReadiness } from '../services/routeService';
import type { QueryResolvers } from '../graphql/generated';

export const Query: QueryResolvers = {
  bikes: async (_, args) => {
    let q = supabase.from('bikes').select('*, bike_types(name)');
    if (args.bikeType) {
      q = q.eq('bike_types.name', args.bikeType);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  bike: async (_, args) => {
    const { data, error } = await supabase.from('bikes').select('*').eq('id', args.id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  rides: async (_, args) => {
    let q = supabase.from('rides').select('*').eq('is_ride_post', true);
    if (args.fromDate) q = q.gte('ride_date', args.fromDate);
    if (args.toDate) q = q.lte('ride_date', args.toDate);
    const { data, error } = await q.limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  routeReadiness: async (_, args) => {
    return getRouteReadiness(args.startPlace, args.startEloc, args.endPlace, args.endEloc, args.bikeType ?? undefined);
  },

  rideSuggestions: async (_, args) => {
    // TODO: implement
    throw new Error(`rideSuggestions not yet implemented (${args.lat}, ${args.lng})`);
  },

  placeAutocomplete: async (_, args) => {
    return getPlaceAutocompleteSuggestions(args.input);
  },
};
