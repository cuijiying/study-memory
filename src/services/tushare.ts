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
  async getStockBasicInfo(): Promise<StockBasicInfo[]> {
    try {
      // First try to get data from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('stock_basic')
        .select('*');

      // If we have data in Supabase and it's the same day, return it
      if (supabaseData && supabaseData.length > 0) {
        return supabaseData;
      }

      // If no data in Supabase or it's a new day, fetch from Tushare
      const response = await axios.post<TushareResponse<{ items: StockBasicInfo[] }>>(
        TUSHARE_API_URL,
        {
          api_name: 'stock_basic',
          token: API_TOKEN,
          params: {
            exchange: '',
            list_status: 'L'
          },
          fields: 'ts_code,symbol,name,area,industry,fullname,enname,cnspell,market,exchange,curr_type,list_status,list_date,delist_date,is_hs,act_name,act_ent_type'
        }
      );

      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }

      const stockData = response.data.data.items;

      // Upsert data to Supabase
      const { error } = await supabase
        .from('stock_basic')
        .upsert(stockData, {
          onConflict: 'ts_code'
        });

      if (error) {
        console.error('Failed to upsert data to Supabase:', error);
      }

      return stockData;
    } catch (error) {
      console.error('Failed to fetch stock basic info:', error);
      return [];
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