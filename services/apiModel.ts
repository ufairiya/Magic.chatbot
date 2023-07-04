import { useCallback } from 'react';

import { useFetch } from '@/hooks/useFetch';
import { getModelEndpoint } from '@/utils/app/api';
import { APP_BASE_URL } from '@/utils/app/const';

export interface GetModelsRequestProps {
  key: string;
}

const apiModel = () => {
  const modelEndpoint = getModelEndpoint(APP_BASE_URL);
  const fetchService = useFetch();

  const getModels = useCallback(
    (params: GetModelsRequestProps, signal?: AbortSignal) => {
      return fetchService.post<GetModelsRequestProps>(modelEndpoint, {
        body: { key: params.key },
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
      });
    },
    [fetchService],
  );

  return {
    getModels,
  };
};

export default apiModel;
