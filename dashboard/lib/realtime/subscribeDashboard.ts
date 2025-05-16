import { supabase } from '@/lib/supabase/client';

export const initRealtimeUpdates = (onUpdate: () => void) => {
  const channel = supabase.channel('dashboard')
    .on('postgres_changes', { event: '*', schema: 'public' }, onUpdate)
    .subscribe();
  return () => channel.unsubscribe();
}; 