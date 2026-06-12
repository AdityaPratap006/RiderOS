import { supabase } from '../db/supabase';

export const Mutation = {
  submitHazardReport: async (
    _: unknown,
    args: { lat: number; lng: number; hazardType: string; description: string }
  ) => {
    const { data, error } = await supabase
      .from('hazard_reports')
      .insert({
        lat: args.lat,
        lng: args.lng,
        hazard_type: args.hazardType,
        severity: 'medium',
        description: args.description,
        source: 'user_submitted',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  toggleFavorite: async (_: unknown, args: { bikeId: string }) => {
    // TODO: pull user from context once Supabase Auth is wired in
    throw new Error(`toggleFavorite not yet implemented (bikeId=${args.bikeId})`);
  },
};
