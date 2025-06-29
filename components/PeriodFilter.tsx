'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DateRangePicker } from '@/components/ui/date-picker';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    Minus,
    Filter,
    RotateCcw
} from 'lucide-react';
import { TimePeriod, getDateRangeForPeriod, getPeriodLabel, formatDateRange } from '@/lib/date-utils';

interface PeriodFilterProps {
    selectedPeriod: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
    customDateRange?: { from?: Date; to?: Date };
    onCustomDateRangeChange?: (from: Date | undefined, to: Date | undefined) => void;
    comparison?: {
        current: number;
        previous: number;
        change: number;
        percentage: number;
        trend: 'up' | 'down' | 'neutral';
    };
    title?: string;
    description?: string;
    showComparison?: boolean;
}

const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this-week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'this-month', label: 'This Month' },

    { value: 'custom', label: 'Custom Range' },
];

export default function PeriodFilter({
    selectedPeriod,
    onPeriodChange,
    customDateRange,
    onCustomDateRangeChange,
    comparison,
    title = "Filter by Period",
    description = "Select a time period to filter the data",
    showComparison = true
}: PeriodFilterProps) {
    const [isCustomOpen, setIsCustomOpen] = useState(selectedPeriod === 'custom');

    const handlePeriodChange = (period: TimePeriod) => {
        onPeriodChange(period);
        setIsCustomOpen(period === 'custom');
    };

    const handleReset = () => {
        onPeriodChange('this-month');
        setIsCustomOpen(false);
        onCustomDateRangeChange?.(undefined, undefined);
    };

    const currentDateRange = getDateRangeForPeriod(selectedPeriod, customDateRange);

    const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-3 h-3" />;
            case 'down': return <TrendingDown className="w-3 h-3" />;
            default: return <Minus className="w-3 h-3" />;
        }
    };

    const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up': return 'text-green-600 bg-green-100';
            case 'down': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-600" />
                            {title}
                        </CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="hover:bg-gray-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Period Selection */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Time Period
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {periodOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant={selectedPeriod === option.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePeriodChange(option.value)}
                                    className={selectedPeriod === option.value
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "hover:bg-blue-50 hover:border-blue-200"
                                    }
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {isCustomOpen && (
                        <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Custom Date Range
                            </Label>
                            <DateRangePicker
                                from={customDateRange?.from}
                                to={customDateRange?.to}
                                onDateRangeChange={onCustomDateRangeChange}
                                placeholder="Select date range"
                            />
                        </div>
                    )}

                    {/* Current Period Display */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    {getPeriodLabel(selectedPeriod)}
                                </span>
                            </div>
                            <Badge variant="outline" className="bg-white text-blue-700 border-blue-300">
                                {formatDateRange(currentDateRange)}
                            </Badge>
                        </div>
                    </div>

                    {/* Period Comparison */}
                    {showComparison && comparison && (
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Period Comparison</span>
                                <Badge
                                    variant="outline"
                                    className={`${getTrendColor(comparison.trend)} border-0`}
                                >
                                    {getTrendIcon(comparison.trend)}
                                    <span className="ml-1">
                                        {comparison.percentage >= 0 ? '+' : ''}{comparison.percentage.toFixed(1)}%
                                    </span>
                                </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-semibold text-gray-900">{comparison.current}</div>
                                    <div className="text-xs text-gray-500">Current</div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold text-gray-600">{comparison.previous}</div>
                                    <div className="text-xs text-gray-500">Previous</div>
                                </div>
                                <div>
                                    <div className={`text-lg font-semibold ${comparison.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {comparison.change >= 0 ? '+' : ''}{comparison.change}
                                    </div>
                                    <div className="text-xs text-gray-500">Change</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}