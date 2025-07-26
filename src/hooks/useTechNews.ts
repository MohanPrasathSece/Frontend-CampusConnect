import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export interface TechNewsItem {
  _id: string;
  title: string;
  description: string;
  link?: string;
  type: string;
  imageUrl?: string;
  createdAt: string;
}

export const useTechNews = () => {
  return useQuery<TechNewsItem[]>({
    queryKey: ["technews"],
    queryFn: async () => {
      const res = await api.get("/technews");
      return res.data;
    },
  });
};
