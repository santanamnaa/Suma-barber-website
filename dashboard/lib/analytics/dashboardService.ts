import { redis } from '../cache/redis';
import { DashboardError } from '../../utils/error';
import type { DashboardData } from '../../types/dashboard';
import { supabase } from '@/lib/supabase/client';

export const getDashboardData = async (range: number): Promise<DashboardData> => {
  const cacheKey = `dashboard-${range}`;
  try {
    // const cachedData = await redis.get(cacheKey);
    // if (cachedData) return JSON.parse(cachedData);

    const { data, error } = await supabase.rpc('get_dashboard_stats', {
      days_param: 30,
    });    
    if (error) throw new DashboardError('API', 'Gagal fetch data dashboard', error);
    await redis.setex(cacheKey, 300, JSON.stringify(data));
    return data;
  } catch (err) {
    throw new DashboardError('DATA', 'Gagal mengambil data dashboard', err);
  }
}; 