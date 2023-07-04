import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import apiModel from '@/services/apiModel';

import {
  cleanConversationHistory,
  cleanSelectedConversation,
} from '@/utils/app/clean';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import {
  saveConversation,
  saveConversations,
  loadConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { saveFolders, loadFolders } from '@/utils/app/folders';
import { savePrompts, loadPrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';

import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';

import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';

import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import { v4 as uuidv4 } from 'uuid';

interface Props {
  serverSideApiKeyIsSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({ serverSideApiKeyIsSet, defaultModelId }: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = apiModel();
  const { getModelsError } = useErrorService();

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });
  
  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;
  
  const stopConversationRef = useRef<boolean>(false);
  
  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
    );
    
    useEffect(() => {
      if (data) dispatch({ field: 'models', value: data });
    }, [data, dispatch]);
    
    useEffect(() => {
      dispatch({ field: 'modelError', value: getModelsError(error) });
    }, [dispatch, error, getModelsError]);
    
    // FETCH MODELS ----------------------------------------------
    
    const handleSelectConversation = (conversation: Conversation) => {
      dispatch({
        field: 'selectedConversation',
        value: conversation,
      });
      
      saveConversation(conversation);
    };
    
    // FOLDER OPERATIONS  --------------------------------------------
    
    const handleCreateFolder = (name: string, type: FolderType) => {
      const newFolder: FolderInterface = {
        id: uuidv4(),
        name,
        type,
      };
      
      const updatedFolders = [...folders, newFolder];
      
      dispatch({ field: 'folders', value: updatedFolders });
      saveFolders(updatedFolders);
    };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: 'conversations', value: updatedConversations });
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: 'loading', value: false });
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // EFFECTS  --------------------------------------------
  
  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation, dispatch]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, dispatch]);

  // ON LOAD --------------------------------------------
  
  useEffect(() => {
    const load = async () => {
      const folders = await loadFolders();
      const prompts = await loadPrompts();
      const conversationHistory = await loadConversations();
      console.log(prompts)
      const settings = getSettings();
      if (settings.theme) {
        dispatch({
          field: 'lightMode',
          value: settings.theme,
        });
      }
      const apiKey = localStorage.getItem('apiKey');
      
      if (serverSideApiKeyIsSet) {
        dispatch({ field: 'apiKey', value: '' });
        
        localStorage.removeItem('apiKey');
      } else if (apiKey) {
        dispatch({ field: 'apiKey', value: apiKey });
      }
      
      if (window.innerWidth < 640) {
        dispatch({ field: 'showChatbar', value: false });
        dispatch({ field: 'showPromptbar', value: false });
      }
      
      const showChatbar = localStorage.getItem('showChatbar');
      if (showChatbar) {
        dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
      }
      
      const showPromptbar = localStorage.getItem('showPromptbar');
      if (showPromptbar) {
        dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
      }
      
      if (folders) {
        dispatch({ field: 'folders', value: JSON.parse(folders) });
      }
      
      if (prompts) {
        dispatch({ field: 'prompts', value: JSON.parse(prompts) });
      }
      
      if (conversationHistory) {
        const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
        const cleanedConversationHistory = cleanConversationHistory(
          parsedConversationHistory,
        );
        dispatch({ field: 'conversations', value: cleanedConversationHistory });
      }
        
      const selectedConversation = localStorage.getItem('selectedConversation');
      if (selectedConversation) {
        const parsedSelectedConversation: Conversation =
          JSON.parse(selectedConversation);
        const cleanedSelectedConversation = cleanSelectedConversation(
          parsedSelectedConversation,
        );
  
        dispatch({
          field: 'selectedConversation',
          value: cleanedSelectedConversation,
        });
      } else {
        const lastConversation = conversations[conversations.length - 1];
        dispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
            folderId: null,
          },
        });
      }
    };
    
    load();
  }, [defaultModelId, dispatch, serverSideApiKeyIsSet, t]);//conversations
  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>IdleMafia Chatbot</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      { selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />

            <div className="flex flex-1">
              <Chat stopConversationRef={stopConversationRef} />
            </div>

            <Promptbar />
          </div>
        </main>
      )}
    </HomeContext.Provider>
      
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
