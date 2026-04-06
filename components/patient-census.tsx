"use client"

import { useMemo, useState } from "react"
import { Activity, Search } from "lucide-react"

import type { Patient, TriageLevel } from "@/data/patients"
import { patients } from "@/data/patients"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
      )
    case "stable":
      return (
        <Badge
          variant="outline"
          className="border-amber-400/90 bg-amber-100 font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
        >
          Stable
        </Badge>
      )
    case "discharge":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/70 bg-emerald-100 font-semibold text-emerald-950 shadow-sm hover:bg-emerald-100"
        >
          Discharge Ready
        </Badge>
      )
  }
}

export function PatientCensus() {
  const [query, setQuery] = useState("")
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <>
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
              Filter by name or MRN
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="relative max-w-md">
            <label htmlFor="census-search" className="sr-only">
              Search patients by name or MRN
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              id="census-search"
              type="search"
              placeholder="Search by patient name or MRN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-10 text-sm text-slate-900 shadow-sm outline-none ring-slate-950/5 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20"
            />
          </div>

          <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-lg sm:ring-1 sm:ring-slate-200/80">
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
                  <TableHead className="h-11 px-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-500"
                    >
                      No patients match &ldquo;{query.trim()}&rdquo;. Try a
                      different name or MRN.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
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
                      <TableCell className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailPatient(row)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={detailPatient !== null}
        onOpenChange={(open) => {
          if (!open) setDetailPatient(null)
        }}
      >
        <DialogContent className="max-h-[min(90vh,40rem)] overflow-y-auto sm:max-w-lg">
          {detailPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-900">
                  {detailPatient.name}
                </DialogTitle>
                <p className="font-mono text-xs text-slate-600">
                  {detailPatient.mrn}
                </p>
                <DialogDescription className="sr-only">
                  Allergies, active medications, last physician note, and last
                  vitals for this patient.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-5 text-sm">
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Allergies
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-800">
                    {detailPatient.allergies.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medications
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-800">
                    {detailPatient.medications.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last physician note
                  </h3>
                  <p className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 leading-relaxed text-slate-800">
                    {detailPatient.physicianNote}
                  </p>
                </section>

                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Last vitals check
                  </h3>
                  <p className="text-slate-700">{detailPatient.lastVitals}</p>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
