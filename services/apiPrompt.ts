import { Prompt } from '@/types/prompt';
import { getPromptEndpoint } from '@/utils/app/api';
import { APP_BASE_URL } from '@/utils/app/const';
import axios from 'axios';

const apiSetPrompt = async (prompts: Prompt[] ) => {
  const endpoint = getPromptEndpoint(APP_BASE_URL);

  return await axios.post(endpoint, {
    prompts
  });
};
//should add user id,   endpoint+`?folders=${folders}`
const apiGetPrompt = async () => {
  const endpoint = getPromptEndpoint(APP_BASE_URL);
  return await axios.get(endpoint)
};

export {
  apiSetPrompt,
  apiGetPrompt
};
