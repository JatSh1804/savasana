export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
    }[];
    title?: string;
}

// export const extractChartsFromMessage = (messageText: string): ChartData[] => {
//     try {
//         // Match different chart formatting patterns to be more flexible
//         const chartRegex = /```(?:<chart>|chart)\s*([\s\S]*?)(?:<\/chart>|```)/g;
//         const chartMatches = Array.from(messageText.matchAll(chartRegex));
//         if (chartMatches.length > 0) {
//             return chartMatches.map(match => {
//                 const chartJson = match[1].trim();
//                 return JSON.parse(chartJson);
//             });
//         }
//     } catch (error) {
//         console.error('Error extracting chart data:', error);
//     }
//     return [];
// };

/**
 * Removes chart tags and their content from the message text
 * while still allowing the charts to be extracted separately
 */
export const removeChartTagsFromText = (messageText: string): string => {
    // Remove chart blocks from the displayed text
    return messageText.replace(/```(?:<chart>|chart)\s*[\s\S]*?(?:<\/chart>|```)/g, '');
};

export const extractChartsFromMessage = (messageText: string): ChartData[] => {
    try {
        // Match different chart formatting patterns to be more flexible
        const chartRegex = /```(?:<chart>|chart)\s*([\s\S]*?)(?:<\/chart>|```)/g;
        const chartMatches = Array.from(messageText.matchAll(chartRegex));
        if (chartMatches.length > 0) {
            return chartMatches.map(match => {
                const chartText = match[1].trim();
                try {
                    // First try direct parsing
                    return JSON.parse(chartText);
                } catch (e) {
                    // If direct parsing fails, try unescaping the string
                    try {
                        // Handle escaped quotes and other escape sequences
                        const unescaped = chartText.replace(/\\"/g, '"')
                                                  .replace(/\\\\/g, '\\')
                                                  .replace(/\\n/g, '\n')
                                                  .replace(/\\t/g, '\t')
                                                  .replace(/\\r/g, '\r');
                        return JSON.parse(unescaped);
                    } catch (e2) {
                        // If that fails, try eval as a last resort (be cautious with this approach)
                        console.warn('Attempting to use eval for JSON parsing - use with caution');
                        // Converting the JSON-like string to a valid object
                        const sanitized = chartText.replace(/\\"/g, '"');
                        // Using Function instead of eval for slightly better security
                        return Function(`"use strict"; return (${sanitized})`)();
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error extracting chart data:', error);
    }
    return [];
};