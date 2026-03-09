/**
 * Shared utility to generate and download CSV files from an array of objects.
 * Works in web environments by creating a blob and a temporary download link.
 * 
 * @param data Array of objects where each object represents a row in the CSV.
 * @param filename Desired name of the downloaded file (without extension).
 */
export const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
        console.warn("No data provided for CSV download.");
        return;
    }

    // Extract headers from the first object
    const headers = Object.keys(data[0]);

    // Construct CSV content
    const csvContent = [
        headers.join(","),
        ...data.map(row => headers.map(header => {
            let val = row[header];

            // Handle null/undefined
            if (val === null || val === undefined) return "";

            // Handle objects (like nested data)
            if (typeof val === 'object') {
                val = JSON.stringify(val).replace(/"/g, '""');
                return `"${val}"`;
            }

            // Handle strings (escape quotes and wrap in quotes)
            if (typeof val === 'string') {
                return `"${val.replace(/"/g, '""')}"`;
            }

            return val;
        }).join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL
    URL.revokeObjectURL(url);
};
