'use client';

import api, * as libApi from '@/lib/api';
import type {
  MaintenanceCase,
  FaultyEntity,
  FaultyEntityStatus,
  MaintenanceAction,
} from '@/lib/models';

export const maintenanceService = {
  getCase: (id: number) => libApi.maintenanceCases.get(id),
  getFaultyEntitiesByCaseId: (caseId: number, skip = 0, limit = 100) =>
    libApi.faultyEntities.listByCaseId(caseId, skip, limit),
  updateFaultyEntity: (entityId: number, data: Partial<FaultyEntity>) =>
    libApi.faultyEntities.update(entityId, data),
  bulkUpdateFaultyEntities: (
    caseId: number,
    payload: {
      entity_ids: number[];
      status: FaultyEntityStatus;
      notes?: string;
    }
  ) =>
    api.patch(`/faulty-entities/bulk-update/`, payload),
  getFaultyEntityHistory: (entityId: number) =>
    libApi.faultyEntities.getMaintenanceHistory(entityId),
  getCaseTimeline: (caseId: number) =>
    api.get<MaintenanceAction[]>(`/maintenance-actions/`, {
      params: { case_id: caseId },
    }),
  confirmFaultyEntity: (entityId: number) =>
    libApi.faultyEntities.update(entityId, { status: 'confirmed_faulty' as FaultyEntityStatus }),
  markEntityHealthy: (entityId: number) =>
    libApi.faultyEntities.update(entityId, { status: 'healthy' as FaultyEntityStatus }),
  setEntityUnderInspection: (entityId: number) =>
    libApi.faultyEntities.update(entityId, { status: 'under_inspection' as FaultyEntityStatus }),
  resolveEntity: (entityId: number) =>
    libApi.faultyEntities.update(entityId, { status: 'resolved' as FaultyEntityStatus }),
  falsePositiveEntity: (entityId: number) =>
    libApi.faultyEntities.update(entityId, { status: 'false_positive' as FaultyEntityStatus }),
};
