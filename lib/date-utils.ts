import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, isWithinInterval } from 'date-fns';

export type TimePeriod = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

export interface DateRange {
    from: Date;
    to: Date;
}

export const getDateRangeForPeriod = (period: TimePeriod, customRange?: { from?: Date; to?: Date }): DateRange => {
    const now = new Date();

    switch (period) {
        case 'today':
            return {
                from: startOfDay(now),
                to: endOfDay(now)
            };

        case 'yesterday':
            const yesterday = subDays(now, 1);
            return {
                from: startOfDay(yesterday),
                to: endOfDay(yesterday)
            };

        case 'this-week':
            return {
                from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
                to: endOfWeek(now, { weekStartsOn: 1 })
            };

        case 'last-week':
            const lastWeek = subWeeks(now, 1);
            return {
                from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
                to: endOfWeek(lastWeek, { weekStartsOn: 1 })
            };

        case 'this-month':
            return {
                from: startOfMonth(now),
                to: endOfMonth(now)
            };

        case 'last-month':
            const lastMonth = subMonths(now, 1);
            return {
                from: startOfMonth(lastMonth),
                to: endOfMonth(lastMonth)
            };

        case 'custom':
            return {
                from: customRange?.from || startOfMonth(now),
                to: customRange?.to || endOfMonth(now)
            };

        default:
            return {
                from: startOfMonth(now),
                to: endOfMonth(now)
            };
    }
};

export const filterDataByDateRange = <T extends { [key: string]: any }>(
    data: T[],
    dateField: keyof T,
    dateRange: DateRange
): T[] => {
    return data.filter(item => {
        const itemDate = new Date(item[dateField] as string);
        return isWithinInterval(itemDate, dateRange);
    });
};

export const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
        case 'today': return 'Today';
        case 'yesterday': return 'Yesterday';
        case 'this-week': return 'This Week';
        case 'last-week': return 'Last Week';
        case 'this-month': return 'This Month';
        case 'last-month': return 'Last Month';
        case 'custom': return 'Custom Range';
        default: return 'All Time';
    }
};

export const formatDateRange = (dateRange: DateRange): string => {
    const { from, to } = dateRange;

    if (from.toDateString() === to.toDateString()) {
        return from.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return `${from.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })} - ${to.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })}`;
};

export const calculatePeriodComparison = <T extends { [key: string]: any }>(
    currentData: T[],
    previousData: T[],
    valueField?: keyof T
): {
    current: number;
    previous: number;
    change: number;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
} => {
    const currentValue = valueField
        ? currentData.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0)
        : currentData.length;

    const previousValue = valueField
        ? previousData.reduce((sum, item) => sum + (Number(item[valueField]) || 0), 0)
        : previousData.length;

    const change = currentValue - previousValue;
    const percentage = previousValue > 0 ? (change / previousValue) * 100 : 0;

    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (change > 0) trend = 'up';
    else if (change < 0) trend = 'down';

    return {
        current: currentValue,
        previous: previousValue,
        change,
        percentage,
        trend
    };
};