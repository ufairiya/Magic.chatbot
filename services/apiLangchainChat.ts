import { getLangchainEndpoint } from '@/utils/app/api';
import { APP_BASE_URL } from '@/utils/app/const';

import { ChatBody } from '@/types/chat';
export interface GetModelsRequestProps {
  key: string;
}

const apiLangchainChat = async (chatBody: ChatBody , controller: AbortController) => {
  const endpoint = getLangchainEndpoint(APP_BASE_URL);

  let body = JSON.stringify(chatBody);

  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
    body,
  });
};

export default apiLangchainChat;
