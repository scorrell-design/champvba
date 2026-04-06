import {
  Activity,
  AlertTriangle,
  BedDouble,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TriageLevel = "critical" | "stable" | "discharge";

const patients: {
  name: string;
  mrn: string;
  triage: TriageLevel;
  lastVitals: string;
}[] = [
  {
    name: "Eleanor Vance",
    mrn: "MRN-482901",
    triage: "critical",
    lastVitals: "14:22 — BP 88/52, SpO₂ 91%",
  },
  {
    name: "Marcus Chen",
    mrn: "MRN-771204",
    triage: "stable",
    lastVitals: "13:05 — BP 128/78, HR 76",
  },
  {
    name: "Priya Desai",
    mrn: "MRN-339018",
    triage: "discharge",
    lastVitals: "12:40 — BP 118/72, afebrile",
  },
  {
    name: "James Okonkwo",
    mrn: "MRN-905612",
    triage: "critical",
    lastVitals: "14:18 — HR 112, RR 24",
  },
  {
    name: "Sofia Ramirez",
    mrn: "MRN-220447",
    triage: "stable",
    lastVitals: "11:52 — BP 132/84, glucose 142",
  },
  {
    name: "Daniel Frost",
    mrn: "MRN-664833",
    triage: "discharge",
    lastVitals: "10:15 — orthostatic vitals WNL",
  },
];

function TriageBadge({ level }: { level: TriageLevel }) {
  switch (level) {
    case "critical":
      return (
        <Badge
          variant="destructive"
          className="border border-red-600/20 bg-red-600 px-2.5 py-0.5 font-semibold text-white shadow-sm hover:bg-red-600"
        >
          Critical
        </Badge>
      );
    case "stable":
      return (
        <Badge
          variant="outline"
          className="border-amber-400/90 bg-amber-100 font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
        >
          Stable
        </Badge>
      );
    case "discharge":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/70 bg-emerald-100 font-semibold text-emerald-950 shadow-sm hover:bg-emerald-100"
        >
          Discharge Ready
        </Badge>
      );
  }
}

export default function Home() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 rounded-xl border border-slate-200/90 bg-white px-6 py-7 shadow-sm ring-1 ring-slate-950/[0.04] sm:px-8">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                St. Gemini Medical Center
              </h1>
              <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
                Clinical Census Dashboard
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 sm:mt-0">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Census synced — local time
            </div>
          </div>
        </header>

        <section aria-labelledby="quick-stats-heading" className="mb-8">
          <h2
            id="quick-stats-heading"
            className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500"
          >
            Quick Stats
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Patients
                </CardTitle>
                <Users
                  className="size-4 text-slate-400"
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  42
                </p>
                <CardDescription className="mt-1 text-xs">
                  Active inpatient census
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  High Priority
                </CardTitle>
                <AlertTriangle
                  className="size-4 text-amber-500"
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  5
                </p>
                <CardDescription className="mt-1 text-xs">
                  Requires enhanced monitoring
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04] sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Available Rooms
                </CardTitle>
                <BedDouble
                  className="size-4 text-emerald-600/80"
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  12
                </p>
                <CardDescription className="mt-1 text-xs">
                  Med–surg &amp; step-down units
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <Card className="overflow-hidden border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04]">
          <CardHeader className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  Patient Census
                </CardTitle>
                <CardDescription>
                  Inpatient roster, identifiers, triage, and last documented
                  vitals
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="size-3.5" aria-hidden />
                Sample rows for layout preview
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Patient Name
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    MRN (ID)
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Triage Level
                  </TableHead>
                  <TableHead className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Last Vitals Check
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((row) => (
                  <TableRow
                    key={row.mrn}
                    className="border-slate-100 hover:bg-slate-50/80"
                  >
                    <TableCell className="px-4 py-3 font-medium text-slate-900">
                      {row.name}
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-xs text-slate-600">
                      {row.mrn}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <TriageBadge level={row.triage} />
                    </TableCell>
                    <TableCell className="max-w-md px-4 py-3 text-slate-600 sm:whitespace-nowrap">
                      {row.lastVitals}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
