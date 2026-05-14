'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDataStore } from '@/lib/data-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import * as maintenanceApi from '@/services/api/maintenance';
import * as MaintenanceTypes from '@/types/maintenance';
import { MaintenanceMiniDashboard } from '@/components/maintenance/MaintenanceMiniDashboard';
import { MaintenanceCaseDialog } from '@/components/maintenance/MaintenanceCaseDialog';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';

export default function MaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    maintenanceCases,
    projects,
    loading,
    createMaintenanceCase,
    updateMaintenanceCase,
    deleteMaintenanceCase,
  } = useDataStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<MaintenanceTypes.MaintenanceCase | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [faultyEntities, setFaultyEntities] = useState<MaintenanceTypes.FaultyEntity[]>([]);
  const [maintenanceActions, setMaintenanceActions] = useState<MaintenanceTypes.MaintenanceAction[]>([]);
  const [maintenanceDeliveries, setMaintenanceDeliveries] = useState<MaintenanceTypes.MaintenanceDelivery[]>([]);

  // Load maintenance cases on mount
  useEffect(() => {
    loadMaintenanceCases();
  }, []);

  const loadMaintenanceCases = async () => {
    try {
      setIsLoadingData(true);
      const res = await maintenanceApi.maintenanceCases.list(0, 100);
      // Note: This data would typically be managed by the data store
      // For now, we're managing it locally in the component
    } catch (err) {
      console.error('Failed to load maintenance cases:', err);
      toast.error('Failed to load maintenance cases');
    } finally {
      setIsLoadingData(false);
    }
  };

  const filtered = maintenanceCases.filter((c) => {
    const matchesSearch =
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesProject = projectFilter === 'all' || c.project_id.toString() === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleCreate = async (data: MaintenanceTypes.CreateMaintenanceCasePayload) => {
    try {
      await createMaintenanceCase(data);
      await loadMaintenanceCases();
    } catch (err) {
      // Error handled by data store
    }
  };

  const handleUpdate = async (data: MaintenanceTypes.UpdateMaintenanceCasePayload) => {
    if (!editingCase) return;
    try {
      await updateMaintenanceCase(editingCase.id, data);
      setEditingCase(null);
      await loadMaintenanceCases();
    } catch (err) {
      // Error handled by data store
    }
  };

  const handleSubmit = async (
    data: MaintenanceTypes.CreateMaintenanceCasePayload | MaintenanceTypes.UpdateMaintenanceCasePayload
  ) => {
    if (editingCase) {
      await handleUpdate(data as MaintenanceTypes.UpdateMaintenanceCasePayload);
    } else {
      await handleCreate(data as MaintenanceTypes.CreateMaintenanceCasePayload);
    }
  };

  const handleDelete = async (caseItem: MaintenanceTypes.MaintenanceCase) => {
    if (caseItem.status !== 'open') {
      toast.error('Can only delete cases with status "Open"');
      return;
    }
    try {
      await deleteMaintenanceCase(caseItem.id);
      await loadMaintenanceCases();
    } catch (err) {
      // Error handled by data store
    }
  };

  const handleEdit = (caseItem: MaintenanceTypes.MaintenanceCase) => {
    setEditingCase(caseItem);
    setIsEditOpen(true);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const getFaultyEntities = async (caseId: number) => {
    try {
      const res = await maintenanceApi.faultyEntities.listByCaseId(caseId);
      setFaultyEntities(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch faulty entities:', err);
      return [];
    }
  };

  const getMaintenanceActions = async (faultyEntityId: number) => {
    try {
      const res = await maintenanceApi.maintenanceActions.listByFaultyEntityId(faultyEntityId);
      setMaintenanceActions(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch maintenance actions:', err);
      return [];
    }
  };

  const getMaintenanceDeliveries = async (caseId: number) => {
    try {
      const res = await maintenanceApi.maintenanceDeliveries.listByCaseId(caseId);
      setMaintenanceDeliveries(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch deliveries:', err);
      return [];
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track maintenance cases, faulty entities, repairs, and deliveries
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Case
        </Button>
      </div>

      {/* Mini Dashboard */}
      <MaintenanceMiniDashboard
        cases={maintenanceCases}
        onStatusFilter={handleStatusFilter}
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search case number or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_inspection">Under Inspection</SelectItem>
              <SelectItem value="under_repair">Under Repair</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-filter">Project</Label>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger id="project-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex items-end">
          <Button
            variant="outline"
            onClick={loadMaintenanceCases}
            disabled={isLoadingData}
            className="w-full"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <MaintenanceTable
        cases={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoadingData}
        getFaultyEntities={getFaultyEntities}
        getMaintenanceActions={getMaintenanceActions}
        getMaintenanceDeliveries={getMaintenanceDeliveries}
      />

      {/* Create/Edit Dialog */}
      <MaintenanceCaseDialog
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setEditingCase(null);
        }}
        onSubmit={handleSubmit}
        editingCase={editingCase}
        projects={projects}
        isLoading={isLoadingData}
      />
    </div>
  );
}
