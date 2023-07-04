import { FolderInterface } from '@/types/folder';
import { apiSetFolder, apiGetFolder } from '@/services/apiFolder';

export const saveFolders = async (folders: FolderInterface[]) => {
  await apiSetFolder(folders);
};

export const loadFolders = async () => {
  const folders = await apiGetFolder();
  if(folders.status) return JSON.stringify(folders.data.data);
};
