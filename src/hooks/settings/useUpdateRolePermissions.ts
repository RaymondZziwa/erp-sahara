import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
    const token = useSelector((state: RootState) => state.userAuth.token.access_token)
  return useMutation({
    mutationFn: async ({ roleId, permissionIds }) => {
      const response = await apiRequest(`/roles/${roleId}/attach-permissions`, "POST", token, {
        permissionIds
      });
      return { roleId, permissions: response.data.permissions };
    },
    onMutate: async ({ roleId, permissionIds }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries(['roles']);
      await queryClient.cancelQueries(['role', roleId]);

      // Snapshot the previous value
      const previousRoles = queryClient.getQueryData(['roles']);
      const previousRole = queryClient.getQueryData(['role', roleId]);

      // Optimistically update the roles list
      if (previousRoles) {
        queryClient.setQueryData(['roles'], old => 
          old.map(role => 
            role.id === roleId 
              ? { ...role, permissions: permissionIds.map(id => ({ id })) }
              : role
          )
        );
      }

      // Optimistically update the individual role
      if (previousRole) {
        queryClient.setQueryData(['role', roleId], old => ({
          ...old,
          permissions: permissionIds.map(id => ({ id }))
        }));
      }

      return { previousRoles, previousRole };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousRoles) {
        queryClient.setQueryData(['roles'], context.previousRoles);
      }
      if (context?.previousRole) {
        queryClient.setQueryData(['role', variables.roleId], context.previousRole);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role', variables.roleId]);
    }
  });
};

export default useUpdateRolePermissions;