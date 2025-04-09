export const formatMoneyFi = (amount: number) => {
    return amount
        .toFixed(2)
        .replace('.', ',')
        + ' €';
}