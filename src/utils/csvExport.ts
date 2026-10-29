/**
 * Helper to export an array of objects to a downloaded CSV file in the browser
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const separator = ',';
  const keys = Object.keys(rows[0]);

  const csvContent =
    keys.map((k) => `"${k.replace(/"/g, '""')}"`).join(separator) +
    '\n' +
    rows
      .map((row) =>
        keys
          .map((k) => {
            let val = row[k];
            if (val === null || val === undefined) {
              val = '';
            } else if (typeof val === 'object') {
              val = JSON.stringify(val);
            } else {
              val = String(val);
            }
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(separator)
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
