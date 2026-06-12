import { supabase } from '../db/supabase';
import { getRouteReadiness } from '../services/routeService';

export const Query = {
  bikes: async (_: unknown, args: { bikeType?: string }) => {
    let q = supabase.from('bikes').select('*, bike_types(name)');
    if (args.bikeType) {
      q = q.eq('bike_types.name', args.bikeType);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  bike: async (_: unknown, args: { id: string }) => {
    const { data, error } = await supabase.from('bikes').select('*').eq('id', args.id).single();
    if (error) throw new Error(error.message);
    return data;
  },

  rides: async (_: unknown, args: { region?: string; fromDate?: string; toDate?: string }) => {
    let q = supabase.from('rides').select('*').eq('is_ride_post', true);
    if (args.fromDate) q = q.gte('ride_date', args.fromDate);
    if (args.toDate) q = q.lte('ride_date', args.toDate);
    const { data, error } = await q.limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  routeReadiness: async (
    _: unknown,
    args: { startPlace: string; endPlace: string; bikeType?: string }
  ) => {
    return getRouteReadiness(args.startPlace, args.endPlace, args.bikeType);
  },

  rideSuggestions: async (
    _: unknown,
    args: { lat: number; lng: number; bikeType?: string; date?: string }
  ) => {
    // TODO: implement
    throw new Error(`rideSuggestions not yet implemented (${args.lat}, ${args.lng})`);
  },
};
