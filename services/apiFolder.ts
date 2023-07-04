import { FolderInterface } from '@/types/folder';
import { getFolderEndpoint } from '@/utils/app/api';
import { APP_BASE_URL } from '@/utils/app/const';
import axios from 'axios';

const apiSetFolder = async (folders: FolderInterface[] ) => {
  const endpoint = getFolderEndpoint(APP_BASE_URL);

  return await axios.post(endpoint, {
    folders: folders
  });
};
//should add user id,   endpoint+`?folders=${folders}`
const apiGetFolder = async () => {
  const endpoint = getFolderEndpoint(APP_BASE_URL);
  return await axios.get(endpoint)
};

export {
  apiSetFolder,
  apiGetFolder
};
