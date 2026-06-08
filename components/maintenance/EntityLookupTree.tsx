'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EntityLookupNode, EntityLookupResponse, lookUpResponse } from '@/lib/models';

interface EntityLookupTreeProps {
  response: lookUpResponse;
  caseId?: number | null;
  onSuspectChildren?: () => Promise<void>;
  onConfirmFault?: (node: EntityLookupNode) => Promise<void>;
}

function TreeNode({
  node,
  depth = 0,
  caseId,
  onConfirmFault,
}: {
  node: EntityLookupNode;
  depth?: number;
  caseId?: number | null;
  onConfirmFault?: (node: EntityLookupNode) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  const indent = depth * 16;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-3 rounded-md p-2 hover:bg-muted/70 transition-colors',
          depth === 0 ? 'bg-muted' : 'bg-card'
        )}
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex h-3 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center text-muted-foreground">•</span>
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {node.label}
            </span>
            <Badge variant="outline" className="text-[11px] uppercase tracking-[0.15em]">
              {node.entity_type}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>ID: {node.entity_id}</span>
            {node.depth !== undefined && <span>Depth: {node.depth}</span>}
          </div>
        </div>
        {caseId && onConfirmFault && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onConfirmFault(node)}
          >
            Confirm Fault
          </Button>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="space-y-1">
          {node.children?.map((child) => (
            <TreeNode
              key={`${child.entity_type}-${child.entity_id}`}
              node={child}
              depth={depth + 1}
              caseId={caseId}
              onConfirmFault={onConfirmFault}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function EntityLookupTree({
  response,
  caseId,
  onSuspectChildren,
  onConfirmFault,
}: EntityLookupTreeProps) {
  return (
    <div className="flex flex-col justify-between">
      <div className="p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-1">
          <div>
            <p className="font-semibold">{response.matched_label}</p>
            <p className="text-xs text-muted-foreground">
              Sr# - {response.matched_entity_serialNumber}
            </p>
          </div>
        </div>
        {caseId && onSuspectChildren && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onSuspectChildren}>
              Suspect Children for Case #{caseId}
            </Button>
          </div>
        )}
      </div>
      <div className = "">
      
      <div className="p-4 flex flex-col">
        <h3 className="flex font-semibold">Ancestors</h3>
        <div className="flex flex-row-reverse mt-3 space-y-2 w-full border justify-between overflow-x-hidden">
          {response.ancestors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ancestors available.</p>
          ) : (
            response.ancestors.map((ancestor) => (
              <div
                key={`${ancestor.entity_type}-${ancestor.entity_id}`}
                className=" breadcrumb not-odd:items-center gap-3 grid grid-cols-1 p-3 max-h-20"
              >
                <span className="text-sm font-bold ">{ancestor.entity_name}</span>
                <Badge variant="outline" className="text-[10px] uppercase bg-amber-50">
                  {ancestor.entity_type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Hierarchy Tree</h3>
        <div className="mt-3 space-y-2">
          <TreeNode
            node={{
              entity_type: response.matched_entity_type,
              entity_id: response.matched_entity_id,
              label: response.matched_label,
              children: response.descendants,
              entity_name : response.matched_label,
              entity_PartNumber: response.matched_entity_PartNumber,
              entity_SerialNumber: response.matched_entity_serialNumber,
            }}
            depth={0}
            caseId={caseId}
            onConfirmFault={onConfirmFault}
          />
        </div>
      </Card>
      </div>
    </div>
  );
}
