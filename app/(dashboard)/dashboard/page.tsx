"use client";

import {
  Rocket,
  Timer,
  CheckCircle2,
  Wrench,
  Package,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/kpi-card";
import { StatusBadge } from "@/components/status-badge";
import {
  projects,
  maintenanceLogs,
  inventory,
  projectStatusData,
  monthlyOrdersData,
  inventoryDistributionData,
} from "@/lib/dummy-data";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const PIE_COLORS = [
  "oklch(0.62 0.15 250)",
  "oklch(0.55 0.14 250)",
  "oklch(0.65 0.15 165)",
  "oklch(0.70 0.18 45)",
  "oklch(0.55 0.2 15)",
];

export default function DashboardPage() {
  const inProgress = projects.filter(
    (p) => p.status === "Building" || p.status === "Testing"
  ).length;
  const delivered = projects.filter((p) => p.status === "Delivered").length;
  const underMaintenance = projects.filter(
    (p) => p.status === "Maintenance"
  ).length;
  const failedComponents = inventory.filter(
    (i) => i.status === "Failed"
  ).length;
  const recentFailures = maintenanceLogs
    .filter((m) => m.status === "Open")
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of satellite lifecycle operations
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Projects"
          value={projects.length}
          change={12}
          icon={Rocket}
          accentColor="blue"
        />
        <KPICard
          title="In Progress"
          value={inProgress}
          change={8}
          icon={Timer}
          accentColor="amber"
        />
        <KPICard
          title="Delivered"
          value={delivered}
          change={25}
          icon={CheckCircle2}
          accentColor="green"
        />
        <KPICard
          title="Maintenance"
          value={underMaintenance}
          change={-5}
          icon={Wrench}
          accentColor="orange"
        />
        <KPICard
          title="Inventory Items"
          value={inventory.length}
          change={15}
          icon={Package}
          accentColor="slate"
        />
        <KPICard
          title="Failed Components"
          value={failedComponents}
          change={-33}
          icon={AlertTriangle}
          accentColor="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project Status Pie */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Projects by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Orders Line */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Monthly Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyOrdersData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="oklch(0.52 0.14 250)"
                  strokeWidth={2.5}
                  dot={{ fill: "oklch(0.52 0.14 250)", r: 4 }}
                  activeDot={{ r: 6, fill: "oklch(0.52 0.14 250)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Distribution Bar */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Inventory Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={inventoryDistributionData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="type"
                  fontSize={11}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  fontSize={12}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="oklch(0.52 0.14 250)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Failures */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Open Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentFailures.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No open issues.</p>
          ) : (
            <div className="space-y-3">
              {recentFailures.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {log.entityName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.faultDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {log.date}
                    </span>
                    <StatusBadge status={log.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
