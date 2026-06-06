'use client'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface PremiumTableProps {
  headers: string[]
  rows: { id: string, cells: React.ReactNode[] }[]
  onRowClick?: (row: any) => void
}

export default function PremiumTable({ headers, rows, onRowClick }: PremiumTableProps) {
  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    gsap.fromTo('.table-row-anim',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', delay: 0.3 }
    )
  }, [rows])

  return (
    <div className="overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.06)] bg-white" style={{ boxShadow: 'var(--card-shadow)' }}>
      <table ref={tableRef} className="w-full text-left text-sm">
        <thead className="bg-[#F8FAFC] border-b border-[rgba(0,0,0,0.06)]">
          <tr>
            {headers.map((h: string, i: number) => (
              <th key={i} className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
          {rows.map((row: any, i: number) => (
            <tr 
              key={row.id || i}
              className={`table-row-anim opacity-0 ${onRowClick ? 'cursor-pointer' : ''}`}
              onMouseEnter={e => gsap.to(e.currentTarget, { background: '#F9FAFB', duration: 0.15 })}
              onMouseLeave={e => gsap.to(e.currentTarget, { background: 'transparent', duration: 0.15 })}
              onClick={() => onRowClick?.(row)}
            >
              {row.cells.map((cell: any, j: number) => (
                <td key={j} className="px-6 py-4 font-medium text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8 text-center text-slate-500">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
