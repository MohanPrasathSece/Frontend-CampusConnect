import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface AcceptedBooking {
  _id: string;
  offer: {
    _id: string;
    skill: string;
    tutor: { _id: string; name: string };
    slot?: { day: string; start: string; end: string };
  };
  slot: { day: string; start: string; end: string };
}

export const useAcceptedBookings = () =>
  useQuery<AcceptedBooking[]>({
    queryKey: ['my-accepted-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/skills/my/accepted-bookings');
      return data;
    },
  });
