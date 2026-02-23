export function formatNaira(amount) {
    if (amount === undefined || amount === null || amount === '') return '';
    const parsed = parseFloat(amount.toString().replace(/,/g, ''));
    if (isNaN(parsed)) return '';
    return `₦ ${parsed.toLocaleString('en-US')}`;
}

export function parseMoney(input) {
    if (input === undefined || input === null || input === '') return '';
    // Remove ₦, spaces, and commas
    const cleaned = input.toString().replace(/[₦\s,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? '' : parsed;
}
