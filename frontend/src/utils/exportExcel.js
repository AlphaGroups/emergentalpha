import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Array} columns - Column definitions [{header: 'Display Name', key: 'data_key'}]
 */
export const exportToExcel = (data, filename, columns) => {
  if (!data || data.length === 0) {
    return false;
  }

  const rows = data.map(item =>
    columns.reduce((row, col) => {
      let val = col.key.split('.').reduce((o, k) => o?.[k], item);
      if (col.transform) val = col.transform(val, item);
      row[col.header] = val ?? '';
      return row;
    }, {})
  );

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-width columns
  const colWidths = columns.map(col => ({
    wch: Math.max(
      col.header.length,
      ...rows.map(r => String(r[col.header] || '').length)
    ) + 2
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  return true;
};
