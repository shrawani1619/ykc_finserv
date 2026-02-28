// Utility for currency formatting
export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || amount === '-') return '-';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Utility for formatting amounts in crores (e.g., 1.5cr, 1.8cr)
export const formatInCrores = (amount) => {
    if (amount === undefined || amount === null || amount === 0) return '₹0';
    const crore = 10000000; // 1 crore = 1,00,00,000
    if (amount >= crore) {
        return `₹${(amount / crore).toFixed(1)}cr`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};