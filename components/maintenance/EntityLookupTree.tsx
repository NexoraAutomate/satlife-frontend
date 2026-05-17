'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EntityLookupNode, EntityLookupResponse } from '@/lib/models';

interface EntityLookupTreeProps {
  response: EntityLookupResponse;
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
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Matched Entity</p>
            <p className="font-semibold">{response.matched_label}</p>
            <p className="text-xs text-muted-foreground">
              {response.matched_entity_type} • ID {response.matched_entity_id}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Project</p>
            <p className="font-semibold">{response.project_name}</p>
            <p className="text-xs text-muted-foreground">ID {response.project_id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Order</p>
            <p className="font-semibold">{response.order_ref}</p>
            <p className="text-xs text-muted-foreground">ID {response.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="font-semibold">{response.customer_name}</p>
            <p className="text-xs text-muted-foreground">ID {response.customer_id}</p>
          </div>
        </div>
        {caseId && onSuspectChildren && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={onSuspectChildren}>
              Suspect Children for Case #{caseId}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Ancestors</h3>
        <div className="mt-3 space-y-2">
          {response.ancestors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ancestors available.</p>
          ) : (
            response.ancestors.map((ancestor) => (
              <div
                key={`${ancestor.entity_type}-${ancestor.entity_id}`}
                className="flex items-center gap-3 rounded-md border border-border p-3"
              >
                <span className="text-sm font-medium">{ancestor.label}</span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {ancestor.entity_type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-semibold">Hierarchy Tree</h3>
        <div className="mt-3 space-y-2">
          <TreeNode
            node={{
              entity_type: response.matched_entity_type,
              entity_id: response.matched_entity_id,
              label: response.matched_label,
              children: response.descendants,
            }}
            depth={0}
            caseId={caseId}
            onConfirmFault={onConfirmFault}
          />
        </div>
      </Card>
    </div>
  );
}
