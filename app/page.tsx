import { AlertTriangle, BedDouble, Users } from "lucide-react";

import { PatientCensus } from "@/components/patient-census";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

        <section aria-labelledby="patient-census-heading" className="mb-8">
          <h2 id="patient-census-heading" className="sr-only">
            Patient census
          </h2>
          <PatientCensus />
        </section>
      </div>
    </div>
  );
}
