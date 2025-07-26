import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useTimetable = () =>
  useQuery({
    queryKey: ['timetable'],
    queryFn: async () => {
      const { data } = await api.get('/timetable');
      return data as { slots: { day: string; startTime: string; endTime: string; subject: string }[] } | null;
    }
  });
