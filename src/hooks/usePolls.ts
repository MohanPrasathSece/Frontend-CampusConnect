import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";

export interface PollOption { text: string; votes: number; }
export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  feedbacks: { user: string; text: string; createdAt: string }[];
  changedOnce: string[];
  isActive: boolean;
  voters: string[];
  createdAt: string;
}

export const usePolls = () => {
  return useQuery<Poll[]>({
    queryKey: ["polls"],
    queryFn: async () => {
      const res = await api.get("/polls");
      return res.data;
    },
  });
};

export const useVotePoll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, optionIndex }: { id: string; optionIndex: number }) => {
      const res = await api.post(`/polls/${id}/vote`, { optionIndex });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["polls"] });
    },
  });
};
