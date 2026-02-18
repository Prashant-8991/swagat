import { CsvDownloadConfig } from '../types';

export function downloadCsv({ data, columns, filename }: CsvDownloadConfig): void {
 const BOM = '\uFEFF';

 const header = columns.map(col => col.label).join(',');

 const rows = data.map(row =>
 columns
 .map(col => {
 const value = row[col.key] ?? '';
 return value.toString().replace(/"/g, '""');
 })
 .join(',')
 );

 const csvContent = [header, ...rows].join('\n');

 const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.setAttribute('download', filename);

 document.body.appendChild(link);
 link.click();

 document.body.removeChild(link);
}
