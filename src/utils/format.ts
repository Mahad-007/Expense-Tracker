import dayjs from 'dayjs';

export function formatCurrency(amount: number, currency: 'PKR' | 'USD' = 'PKR'): string {
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  }
  return `Rs. ${amount.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;
}

export function formatDate(date: string): string {
  return dayjs(date).format('MMM D, YYYY');
}

export function formatDateShort(date: string): string {
  return dayjs(date).format('MMM D');
}

export function formatMonth(date: string): string {
  return dayjs(date).format('MMM YY');
}

export function getCurrentMonth(): {start: string; end: string} {
  const now = dayjs();
  return {
    start: now.startOf('month').format('YYYY-MM-DD'),
    end: now.endOf('month').format('YYYY-MM-DD'),
  };
}

export function getLast6Months(): {start: string; end: string} {
  const now = dayjs();
  return {
    start: now.subtract(5, 'month').startOf('month').format('YYYY-MM-DD'),
    end: now.endOf('month').format('YYYY-MM-DD'),
  };
}
