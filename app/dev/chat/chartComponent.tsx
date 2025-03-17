'use client'

import { useEffect, useRef } from 'react'
import { Bar, Pie, Line, Scatter } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
)

interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
    }[];
    title?: string;
}

interface ChartComponentProps {
    data: ChartData;
}

// Function to generate random colors if not provided
const generateColors = (count: number, alpha = 0.6) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360; // Use golden angle to distribute colors
        colors.push(`hsla(${hue}, 70%, 60%, ${alpha})`);
    }
    return colors;
}

export default function ChartComponent({ data }: ChartComponentProps) {
    // Create separate refs for each chart type
    const barChartRef = useRef<ChartJS<'bar'>>(null);
    const lineChartRef = useRef<ChartJS<'line'>>(null);
    const pieChartRef = useRef<ChartJS<'pie'>>(null);
    const scatterChartRef = useRef<ChartJS<'scatter'>>(null);
    console.log('Generating Chart')

    // Process the datasets to ensure they have colors
    useEffect(() => {
        if (data.datasets) {
            data.datasets.forEach(dataset => {
                if (!dataset.backgroundColor) {
                    dataset.backgroundColor = data.type === 'pie'
                        ? generateColors(dataset.data.length)
                        : generateColors(1)[0];
                }

                if (!dataset.borderColor && (data.type === 'line' || data.type === 'scatter')) {
                    dataset.borderColor = data.type === 'line'
                        ? generateColors(1, 1)[0]
                        : dataset.data.map(() => generateColors(1, 1)[0]);
                }

                if (!dataset.borderWidth && (data.type === 'line' || data.type === 'bar')) {
                    dataset.borderWidth = 1;
                }
            });
        }
    }, [data]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: !!data.title,
                text: data.title || '',
            }
        }
    }
    // Render the appropriate chart type
    const renderChart = () => {
        switch (data.type) {
            case 'bar':
                return <Bar data={data} options={chartOptions} ref={barChartRef} />;
            case 'line':
                return <Line data={data} options={chartOptions} ref={lineChartRef} />;
            case 'pie':
                return <Pie data={data} options={chartOptions} ref={pieChartRef} />;
            case 'scatter':
                return <Scatter data={data} options={chartOptions} ref={scatterChartRef} />;
            default:
                return <div>Unsupported chart type</div>;
        }
    };

    return (
        <div className="w-full h-full">
            {renderChart()}
        </div>
    );
}
