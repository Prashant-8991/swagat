export function downloadCsv({
 data,
 columns,
 filename
}: {
 data: any[];
 columns: { key: string; label: string }[];
 filename: string;
}) {
 
 const BOM = '\uFEFF';
 const header = columns.map(col => `"${col.label}"`).join(',');

 const rows = data.map(row =>
 columns.map(col => {
 
 const value = row[col.key] ?? '';
 const stringValue = value.toString().replace(/"/g, '""');
 return `"${stringValue}"`;
 }).join(',')
 );
 
 const csvContent = [header, ...rows].join('\r\n');
 
 const blob = new Blob([BOM + csvContent], { 
 type: 'text/csv;charset=utf-8;' 
 });
 
 const link = document.createElement('a');
 link.href = URL.createObjectURL(blob);
 link.setAttribute('download', filename);
 
 document.body.appendChild(link);
 link.click();
 
 document.body.removeChild(link);
 URL.revokeObjectURL(link.href);
}
