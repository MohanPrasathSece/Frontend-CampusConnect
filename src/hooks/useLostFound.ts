import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useLostFound = () =>
  useQuery({
    queryKey: ['lostfound'],
    queryFn: async () => {
      const { data } = await api.get('/lostfound');
      return data as any[];
    }
  });
