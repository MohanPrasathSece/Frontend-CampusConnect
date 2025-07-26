import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data } = await api.get('/announcements');
      return data;
    }
  });
};
