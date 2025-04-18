export const formatMoneyFi = (amount: number, decimals = 2) => {
    return amount
        .toFixed(decimals)
        .replace('.', ',')
        + ' €';
}
export const formatPercentage = (amount: number, decimals = 2) => {
    return amount
        .toFixed(decimals)
        .replace('.', ',')
        + ' %';
}