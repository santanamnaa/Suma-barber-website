import { supabase } from '@/lib/supabase/client';
import { DashboardError } from '../utils/error';

export const validateAdminSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (!session?.user || error) {
    throw new DashboardError('AUTH', 'Sesi tidak valid', error);
  }
  const { data: admin } = await supabase
    .from('admins')
    .select('id, role')
    .eq('email', session.user.email)
    .single();
  if (!admin) {
    throw new DashboardError('AUTH', 'Akses admin diperlukan');
  }
  return { session, admin };
}; 