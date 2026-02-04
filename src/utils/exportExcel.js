import * as XLSX from 'xlsx';

/**
 * Export an array of row objects to Excel and trigger download.
 * Uses current filtered/sorted data when called from list pages.
 * @param {Object[]} rows - Array of plain objects (keys = column headers)
 * @param {string} filename - Download filename (without .xlsx)
 * @param {string} [sheetName='Export'] - Sheet name
 */
export function exportToExcel(rows, filename, sheetName = 'Export') {
  if (!rows || rows.length === 0) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
