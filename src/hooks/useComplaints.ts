import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useComplaints = () =>
  useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data } = await api.get('/complaints');
      return data as any[];
    }
  });
