'use client';

import { useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { EntityStatusBadge } from './entity-status-badge';
import type { FaultyEntity } from '@/lib/models';

interface EntityDetailSheetProps {
  entity: FaultyEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmFaulty?: () => void;
  onMarkHealthy?: () => void;
}

export function EntityDetailSheet({
  entity,
  open,
  onOpenChange,
  onConfirmFaulty,
  onMarkHealthy,
}: EntityDetailSheetProps) {
  const details = useMemo(
    () => [
      { label: 'Part Number', value: entity?.part_number || 'N/A' },
      { label: 'Serial Number', value: entity?.serial_number || 'N/A' },
      { label: 'Fault Type', value: entity?.fault_type || 'Unknown' },
      { label: 'Status', value: entity?.status || 'unknown' },
      { label: 'Identified At', value: entity?.identified_at ? new Date(entity.identified_at).toLocaleString() : 'Unknown' },
    ],
    [entity]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Faulty Entity Details</SheetTitle>
          <SheetDescription>Review the investigation details and update the status if needed.</SheetDescription>
        </SheetHeader>

        {!entity ? (
          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted p-6 text-sm text-muted-foreground">
            Select an entity to see investigation details.
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border border-border bg-background p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity</p>
                  <h2 className="text-xl font-semibold">{entity.part_number}</h2>
                </div>
                <EntityStatusBadge status={entity.status} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {details.map((item) => (
                  <div key={item.label} className="space-y-1 rounded-lg bg-muted p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={onConfirmFaulty} disabled={!entity || entity.status === 'confirmed_faulty'}>
                Confirm Faulty
              </Button>
              <Button variant="secondary" onClick={onMarkHealthy} disabled={!entity || entity.status === 'healthy'}>
                Mark Healthy
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
