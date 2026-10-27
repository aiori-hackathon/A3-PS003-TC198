import React from 'react';

export default function DataTable({
  columns,
  data,
  emptyText = "No records found",
  onRowClick,
  containerClassName = "",
  maxHeight
}) {
  if (!data || data.length === 0) {
    return <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">{emptyText}</div>;
  }

  const heightStyle = maxHeight ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : undefined;

  return (
    <div
      style={heightStyle}
      className={`overflow-x-auto w-full ${maxHeight ? 'overflow-y-auto custom-scrollbar' : ''} ${containerClassName}`}
    >
      <table className="w-full text-left text-[13.5px]">
        <thead className="sticky top-0 z-10 text-[12.5px] uppercase tracking-wider text-slate-700 dark:text-[#B8C7D8] bg-slate-100 dark:bg-[#071624] border-b border-slate-200 dark:border-[#17364E] shadow-xs">
          <tr>
            {columns.map((col, index) => (
              <th key={col.key || index} className={`py-3 px-3.5 font-semibold text-slate-700 dark:text-[#F5F8FC] ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-[#17364E]/60">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col, colIndex) => (
                <td key={col.key || colIndex} className={`py-3 px-3.5 text-slate-800 dark:text-[#E2EDF8] tabular-nums font-medium leading-normal ${col.className || ''}`}>
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
