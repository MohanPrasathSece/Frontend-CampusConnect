import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { AcceptedBooking } from './useAcceptedBookings';

export const useMyBookings = () =>
  useQuery<AcceptedBooking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/skills/my/bookings');
      return data;
    },
  });
