import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export const useBookings = (offerId: string | null) =>
  useQuery({
    queryKey: ['bookings', offerId],
    enabled: !!offerId,
    queryFn: async () => {
      const { data } = await api.get(`/skills/${offerId}/bookings`);
      return data as any[];
    },
  });
