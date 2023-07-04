import { Conversation } from '@/types/chat';
import { apiSetConversation, apiGetConversation } from '@/services/apiConversation';

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};

export const saveConversations = async (conversations: Conversation[]) => {
  await apiSetConversation(conversations);
};

export const loadConversations = async () => {
  const conversations = await apiGetConversation();
  if(conversations.status) return JSON.stringify(conversations.data.data);
};
