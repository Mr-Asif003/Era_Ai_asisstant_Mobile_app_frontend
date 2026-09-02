// hooks/useConversations.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "./conversation.service";

export const useConversations = () =>
  useQuery({
    queryKey: ["conversations"],
    queryFn: conversationService.getAll,
  });

export const useCreateDirectConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => conversationService.createDirect(email),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return conversation;
    },
  });
};