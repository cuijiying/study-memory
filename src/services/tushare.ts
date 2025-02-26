import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const TUSHARE_API_URL = '/api';
const API_TOKEN = import.meta.env.VITE_TUSHARE_TOKEN || '';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TushareResponse<T> {
  code: number;
  msg: string;
  data: T;
}

interface StockBasicInfo {
  ts_code: string;
  symbol: string;
  name: string;
  area: string;
  industry: string;
  fullname: string;
  enname: string;
  cnspell: string;
  market: string;
  exchange: string;
  curr_type: string;
  list_status: string;
  list_date: string;
  delist_date: string;
  is_hs: string;
  act_name: string;
  act_ent_type: string;
}

export const tushareApi = {
  async getStockBasicInfo(page: number = 1, pageSize: number = 20): Promise<{ data: StockBasicInfo[], total: number }> {
    try {
      // First try to get data from Supabase
      const { count: total, error: countError } = await supabase
        .from('stock_basic')
        .select('*', { count: 'exact', head: true });

      console.log('total', total);
      if (countError) throw countError;

      const { data: supabaseData, error: supabaseError } = await supabase
        .from('stock_basic')
        .select('*')
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (supabaseError) throw supabaseError;

      return {
        data: supabaseData || [],
        total: total || 0
      };
    } catch (error) {
      console.error('Failed to fetch stock basic info:', error);
      return { data: [], total: 0 };
    }
  },

  async getDailyData(tsCode: string): Promise<any> {
    try {
      const response = await axios.post(
        TUSHARE_API_URL,
        {
          api_name: 'daily',
          token: API_TOKEN,
          params: {
            ts_code: tsCode,
            start_date: '',
            end_date: ''
          },
          fields: 'trade_date,open,high,low,close,vol'
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }

      return response.data.data.items;
    } catch (error) {
      console.error('Failed to fetch daily data:', error);
      return [];
    }
  }
};