// Utility for currency formatting
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '-') return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};