import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  emptyIcon?: LucideIcon
  onRowClick?: (row: TData) => void
  rowClassName?: (row: TData) => string | undefined
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No results found',
  emptyIcon: EmptyIcon,
  onRowClick,
  rowClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                    className={cn(
                      'px-4 py-3 text-left text-table-header uppercase tracking-wider text-gray-500',
                      header.column.getCanSort() && 'cursor-pointer select-none',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.length === 0
                ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          {EmptyIcon && <EmptyIcon className="h-10 w-10" />}
                          <p className="text-sm">{emptyMessage}</p>
                        </div>
                      </td>
                    </tr>
                  )
                : table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-gray-200 transition-colors hover:bg-gray-50',
                        onRowClick && 'cursor-pointer',
                        rowClassName?.(row.original),
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3 text-sm text-gray-700">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {!isLoading && totalRows > 0 && (
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 px-4 py-3">
          <span className="text-sm text-gray-500">
            Showing {startRow}-{endRow} of {totalRows}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
