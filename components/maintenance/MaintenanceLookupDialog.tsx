'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntityLookupTree } from './EntityLookupTree';
import type { EntityLookupNode, EntityLookupResponse } from '@/lib/models';

interface MaintenanceLookupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  partNumber: string;
  setPartNumber: (value: string) => void;
  onLookup: (partNumber: string) => Promise<void>;
  onCreateCase: () => Promise<void>;
  lookupResponse: EntityLookupResponse | null;
  caseId?: number | null;
  lookupLoading?: boolean;
  lookupError?: string | null;
  onSuspectChildren?: () => Promise<void>;
  onConfirmFault?: (node: EntityLookupNode) => Promise<void>;
}

export function MaintenanceLookupDialog({
  isOpen,
  onOpenChange,
  partNumber,
  setPartNumber,
  onLookup,
  onCreateCase,
  lookupResponse,
  caseId,
  lookupLoading,
  lookupError,
  onSuspectChildren,
  onConfirmFault,
}: MaintenanceLookupDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Maintenance Entity Lookup</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="part-number">Part Number</Label>
            <Input
              id="part-number"
              value={partNumber}
              onChange={(event) => setPartNumber(event.target.value)}
              placeholder="Enter part number to lookup"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => onLookup(partNumber)}
              disabled={lookupLoading || partNumber.trim().length === 0}
            >
              {lookupLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Lookup
            </Button>
            {lookupResponse && !caseId ? (
              <Button onClick={onCreateCase} variant="secondary">
                Create Maintenance Case
              </Button>
            ) : null}
            {lookupResponse && caseId ? (
              <>
                {console.log("Condition TRUE", lookupResponse, caseId)}
                
                <Button onClick={onSuspectChildren} variant="secondary">
                  Suspect Children
                </Button>
              </>
            ) : null}
          </div>
          {lookupError ? (
            <p className="text-sm text-destructive">{lookupError}</p>
          ) : null}
          {lookupResponse ? (
            <EntityLookupTree
              response={lookupResponse}
              caseId={caseId}
              onSuspectChildren={onSuspectChildren}
              onConfirmFault={onConfirmFault}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Use the part number lookup to load the entity and its hierarchy.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
