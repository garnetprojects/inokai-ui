import { useQueryClient } from '@tanstack/react-query';

export const useInvalidate = () => {
  const queryClient = useQueryClient();

  const invalidate = (queryKey = []) => {
    queryClient.invalidateQueries({ queryKey });
  };

  return { invalidate };
};
