'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { MaintenanceLookupDialog } from '@/components/maintenance/MaintenanceLookupDialog';
import { MaintenanceCaseDialog } from '@/components/maintenance/MaintenanceCaseDialog';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';

export default function MaintenancePage() {
  const searchParams = useSearchParams();
  const {
    maintenanceCases,
    projects,
    loading,
    createMaintenanceCase,
    updateMaintenanceCase,
    deleteMaintenanceCase,
    lookupEntityByPartNumber,
    suspectChildren,
    confirmFault,
  } = useDataStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<MaintenanceTypes.MaintenanceCase | null>(null);
  const [partNumber, setPartNumber] = useState('');
  const [lookupResponse, setLookupResponse] = useState<MaintenanceTypes.EntityLookupResponse | null>(null);
  const [lookupCaseId, setLookupCaseId] = useState<number | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
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

  const handleLookup = async (partNumberValue: string) => {
    setLookupError(null);
    setLookupLoading(true);
    setLookupResponse(null);
    setLookupCaseId(null);

    try {
      const response = await lookupEntityByPartNumber(partNumberValue);
      setLookupResponse(response);
    } catch (err) {
      console.error('Lookup failed:', err);
      setLookupError('No entity found for that part number.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCreateCaseFromLookup = async () => {
    if (!lookupResponse) {
      toast.error('No lookup result available to create a case.');
      return;
    }

    const payload: MaintenanceTypes.CreateMaintenanceCasePayload = {
      project_id: lookupResponse.project_id,
      description: `Maintenance case for ${lookupResponse.matched_label}`,
      status: MaintenanceTypes.CaseStatus.Open,
    };

    try {
      const created = await createMaintenanceCase(payload);
      setLookupCaseId(created.id);
      await loadMaintenanceCases();
      toast.success(`Created maintenance case #${created.id}`);
    } catch (err) {
      // Error handled by data store
    }
  };

  const handleSuspectChildren = async () => {
    if (!lookupResponse || !lookupCaseId) return;

    try {
      await suspectChildren(lookupCaseId, {
        reported_entity_type: lookupResponse.matched_entity_type,
        reported_entity_id: lookupResponse.matched_entity_id,
        fault_type: 'suspected',
        fault_description: `Suspected issue on ${lookupResponse.matched_label}`,
      });
      toast.success('Children suspicion workflow started.');
    } catch (err) {
      console.error('Suspect children failed:', err);
    }
  };

  const handleConfirmFault = async (node: MaintenanceTypes.EntityLookupNode) => {
    if (!lookupResponse || !lookupCaseId) return;

    try {
      await confirmFault(lookupCaseId, {
        confirmed_entity_type: node.entity_type,
        confirmed_entity_id: node.entity_id,
        fault_type: 'confirmed',
        fault_description: `Fault confirmed for ${node.label}`,
        parent_faulty_entity_id: lookupResponse.matched_entity_id,
      });
      toast.success(`Confirmed fault for ${node.label}`);
    } catch (err) {
      console.error('Confirm fault failed:', err);
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
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Maintenance Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track maintenance cases, faulty entities, repairs, and deliveries
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsLookupOpen(true)} variant="secondary" className="gap-2">
            <Search className="h-4 w-4" />
            Lookup by Part Number
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Case
          </Button>
        </div>
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

      {/* Lookup Dialog */}
      <MaintenanceLookupDialog
        isOpen={isLookupOpen}
        onOpenChange={(open) => {
          setIsLookupOpen(open);
          if (!open) {
            setLookupResponse(null);
            setLookupError(null);
            setLookupCaseId(null);
            setPartNumber('');
          }
        }}
        partNumber={partNumber}
        setPartNumber={setPartNumber}
        onLookup={handleLookup}
        onCreateCase={handleCreateCaseFromLookup}
        lookupResponse={lookupResponse}
        caseId={lookupCaseId}
        lookupLoading={lookupLoading}
        lookupError={lookupError}
        onSuspectChildren={handleSuspectChildren}
        onConfirmFault={handleConfirmFault}
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
