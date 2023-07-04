import { Conversation } from '@/types/chat';
import { getConversationEndpoint } from '@/utils/app/api';
import { APP_BASE_URL } from '@/utils/app/const';
import axios from 'axios';

const apiSetConversation = async (conversations: Conversation[] ) => {
  const endpoint = getConversationEndpoint(APP_BASE_URL);

  return await axios.post(endpoint, {
    conversation: conversations
  });
};
//should add user id,   endpoint+`?folders=${folders}`
const apiGetConversation = async () => {
  const endpoint = getConversationEndpoint(APP_BASE_URL);
  return await axios.get(endpoint)
};

export {
  apiSetConversation,
  apiGetConversation
};
