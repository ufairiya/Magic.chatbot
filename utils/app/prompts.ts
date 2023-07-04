import { Prompt } from '@/types/prompt';
import { apiSetPrompt, apiGetPrompt } from '@/services/apiPrompt';

export const updatePrompt = (updatedPrompt: Prompt, allPrompts: Prompt[]) => {
  const updatedPrompts = allPrompts.map((c) => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt;
    }

    return c;
  });

  savePrompts(updatedPrompts);

  return {
    single: updatedPrompt,
    all: updatedPrompts,
  };
};

export const savePrompts = async (prompts: Prompt[]) => {
  await apiSetPrompt(prompts);
};

export const loadPrompts = async () => {
  const prompts = await apiGetPrompt();
  if(prompts.status) return JSON.stringify(prompts.data.data);
};
