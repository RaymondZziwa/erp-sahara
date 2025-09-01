import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Icon } from '@iconify/react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { PropagateLoader } from 'react-spinners';
import useModulePermissions from '../../hooks/settings/usePermissions';
import useUpdateRolePermissions from '../../hooks/settings/useUpdateRolePermissions';
import Table from '../../components/table';
import { apiRequest } from '../../utils/api';
import { SETTINGS_ENDPOINTS } from '../../api/settingEndpoints';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import useRoles from '../../hooks/settings/useRoles';

interface Permission {
  id: string;
  name: string;
  description?: string;
  guard_name?: string;
  enabled: boolean;
  category: string;
}

const RolePermissionsPage = () => {
  const { id } = useParams();
  const tableRef = useRef<any>(null);
  const { refresh } = useRoles()
  const allPermissions = useSelector((state: RootState) => state?.userAuth?.user?.organisation.services || [])

  const { isLoading } = useModulePermissions();
  const { mutate: updatePermissions, isLoading: isUpdating } = useUpdateRolePermissions();
  const location = useLocation()
  const token = useSelector((state: RootState) => state.userAuth.token.access_token);
  const { selectedRolePermissions } = location.state || {};


  // State management
  const [permissionStates, setPermissionStates] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({ all: 0 });

  // Initialize permissions state and compare with selectedRolePermissions
  useEffect(() => {
    if (allPermissions) {
      const initialStates: Record<string, boolean> = {};
      const counts: Record<string, number> = { all: 0 };
      
      allPermissions.forEach(category => {
        counts[category.name] = category.permissions.length;
        counts.all += category.permissions.length;
        
        category.permissions.forEach(perm => {
          // Check if this permission exists in selectedRolePermissions
          const isEnabled = selectedRolePermissions 
            ? selectedRolePermissions.some((selectedPerm: Permission) => selectedPerm.id === perm.id)
            : false;
            
          initialStates[perm.id] = isEnabled;
        });
      });

      setPermissionStates(initialStates);
      setCategoryCounts(counts);
    }
  }, [allPermissions, selectedRolePermissions]);

  // Prepare permissions data for table
  useEffect(() => {
    if (allPermissions) {
      const permissions = allPermissions.flatMap(category => 
        category.permissions.map(perm => ({
          ...perm,
          category: category.name,
          enabled: permissionStates[perm.id] || false
        }))
      );
      setFilteredPermissions(filterPermissions(permissions));
    }
  }, [allPermissions, permissionStates, selectedCategory, searchQuery]);

  // Filter permissions based on category and search query
  const filterPermissions = (permissions: Permission[]) => {
    let result = permissions;

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(perm => perm.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(perm =>
        perm.name.toLowerCase().includes(query) ||
        perm.description?.toLowerCase().includes(query) ||
        perm.category.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const handleToggleCategory = (category: string, enable: boolean) => {
    if (!allPermissions) return;
  
    setPermissionStates((prev) => {
      const newStates = { ...prev };
  
      // loop through category permissions and set them all
      const categoryObj = allPermissions.find((c: any) => c.name === category);
      if (categoryObj) {
        categoryObj.permissions.forEach((perm: Permission) => {
          newStates[perm.id] = enable;
        });
      }
  
      return newStates;
    });
  };
  

  // Toggle permission state
  const handleTogglePermission = (permissionId: string) => {
    setPermissionStates(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }));
  };

  // Save permissions to server
  const handleSavePermissions = async () => {
    const selectedPermissionIds = Object.entries(permissionStates)
      .filter(([_, isEnabled]) => isEnabled)
      .map(([id]) => id);

    try {
      await apiRequest(SETTINGS_ENDPOINTS.PERMISSIONS.ATTACH(id), "POST", token, {
        permissions: selectedPermissionIds
      })
      toast.success('Permissions updated successfully!');
      refresh()
    } catch (error) {
      toast.error('Failed to update permissions');
      console.error(error);
    }
  };

  // Table column definitions
  const columnDefinitions: ColDef<Permission>[] = [
    {
      headerName: "Permission",
      field: "name",
      sortable: true,
      filter: true,
      cellRenderer: (params: ICellRendererParams<Permission>) => (
        <div className="flex flex-col">
          <span className="font-medium">{params.data?.name}</span>
          {params.data?.description && (
            <span className="text-sm text-gray-500">{params.data.description}</span>
          )}
        </div>
      ),
      flex: 1,
      minWidth: 200,
      maxWidth: 350,
      wrapText: true,
      autoHeight: true
    },
    {
      headerName: "Category",
      field: "category",
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 120,
      maxWidth: 180
    },
    
    {
      headerName: "Status",
      field: "enabled",
      sortable: true,
      cellRenderer: (params: ICellRendererParams<Permission>) => (
        <button
          onClick={() => handleTogglePermission(params.data?.id)}
          className="p-1 rounded-full focus:outline-none transition-colors hover:bg-gray-100"
          aria-label={`Toggle ${params.data?.name} permission`}
        >
          {params.data?.enabled ? (
            <Icon icon="mdi:toggle-switch" className="text-teal-600 text-2xl" />
          ) : (
            <Icon icon="mdi:toggle-switch-off" className="text-gray-400 text-2xl" />
          )}
        </button>
      ),
      width: 100,
      suppressSizeToFit: true
    },
  ];

  if (isLoading || !allPermissions) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PropagateLoader color="#007f80"/>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-white rounded-lg shadow-sm w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Role Permissions Management</h1>
          <Button
            onClick={handleSavePermissions}
            disabled={isUpdating}
            size="small"
            className={`bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 text-sm ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            icon={isUpdating ? "pi pi-spinner pi-spin" : "pi pi-save"}
            label="Save Permissions"
          />

        </div>

        {/* Search and Filter Controls */}
        <div className="p-4 border-b border-gray-200 w-full">
          <div className="flex flex-col gap-4 w-full">
            {/* Search Input */}
            <div className="w-full md:w-1/3 min-w-[200px]">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <Icon icon="solar:magnifer-linear" fontSize={16} />
                </span>
                <InputText
                  placeholder="Search permissions..."
                  value={searchQuery}
                  size='small'
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
    {/* Category Filters */}
<div className="w-full">
  <div className="flex flex-wrap gap-2 items-center">
    {Object.entries(categoryCounts).map(([category, count]) => {
      // compute if category is fully active (all permissions enabled)
      const categoryObj = allPermissions.find((c: any) => c.name === category);
      const isCategoryActive =
        categoryObj &&
        categoryObj.permissions.length > 0 &&
        categoryObj.permissions.every((perm: Permission) => permissionStates[perm.id]);

      return (
        <div key={category} className="flex items-center gap-2">
          <Button
            onClick={() => setSelectedCategory(category)}
            outlined={category !== selectedCategory}
            size="small"
            severity="info"
            type="button"
            label={category}
            className={`whitespace-nowrap capitalize ${
              category === selectedCategory
                ? ""
                : "bg-white !text-gray-700 hover:!bg-gray-100"
            }`}
            badge={count?.toString()}
            badgeClassName="bg-teal-500 text-white rounded-full"
          />

          {/* Only show bulk toggle if not "all" */}
          {category !== "all" && (
            <div
              className="cursor-pointer"
              onClick={() => handleToggleCategory(category, !isCategoryActive)}
            >
              {isCategoryActive ? (
                <Icon icon="mdi:toggle-switch" className="text-teal-600 text-3xl" />
              ) : (
                <Icon icon="mdi:toggle-switch-off" className="text-gray-400 text-3xl" />
              )}
            </div>
          )}
        </div>
      );
    })}
  </div>
</div>
          </div>
          </div>

        {/* Permissions Table */}
        <div className="p-4 w-full overflow-hidden">
          <Table
            columnDefs={columnDefinitions}
            data={filteredPermissions}
            ref={tableRef}
            rowHeight={60}
            className="w-full"
            domLayout="autoHeight"
            suppressSizeToFit={true}
            headerHeight={50}
            defaultColDef={{
              resizable: true,
              suppressSizeToFit: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsPage;