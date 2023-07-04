
export const getEndpoint = (base_url: string) => {
  return base_url + '/api/chat';
};
export const getLangchainEndpoint = (base_url: string) => {
  return base_url + '/api/langchainChat';
};
export const getModelEndpoint = (base_url: string) => {
  return base_url + '/api/model';
}

export const getFolderEndpoint = (base_url: string) => {
  return base_url + '/api/folders/';
}

export const getPromptEndpoint = (base_url: string) => {
  return base_url + '/api/prompts/';
}

export const getConversationEndpoint = (base_url: string) => {
  return base_url + '/api/conversation/';
}