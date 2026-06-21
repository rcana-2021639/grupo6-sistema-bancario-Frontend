const CURRENCY_SYMBOLS = {
    GTQ: "Q",
    USD: "$",
    EUR: "€",
    MXN: "$",
    HNL: "L",
    COP: "$",
};

export const formatBalance = (amount, currencyCode = "GTQ") => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const num = Number(amount || 0);
    return `${symbol} ${num.toLocaleString("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const formatCompact = (amount, currencyCode = "GTQ") => {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
    const num = Number(amount || 0);
    if (num >= 1_000_000) return `${symbol}${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${symbol}${(num / 1_000).toFixed(1)}K`;
    return `${symbol}${num.toFixed(2)}`;
};

export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
};

export const maskAccount = (number) => {
    if (!number) return "****";
    const str = String(number);
    return `****${str.slice(-4)}`;
};

export const maskDPI = (dpi) => {
    if (!dpi) return "—";
    const str = String(dpi);
    if (str.length < 5) return str;
    return `${str.slice(0, 4)}${"*".repeat(str.length - 7)}${str.slice(-3)}`;
};

export const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Intl.DateTimeFormat("es-GT", { dateStyle: "medium" }).format(
            new Date(value),
        );
    } catch {
        return "—";
    }
};

export const getTransactionIcon = (type) => {
    switch (type) {
        case "deposito": return "add-circle-outline";
        case "retiro": return "remove-circle-outline";
        case "transferencia": return "send-outline";
        case "pago_servicio": return "flash-outline";
        case "pago_prestamo": return "home-outline";
        case "compra_tarjeta": return "card-outline";
        default: return "swap-horizontal-outline";
    }
};

export const isIncomeTransaction = (tx, userAccountNumbers = []) => {
    if (tx.transactionType === "deposito") return true;
    if (tx.transactionType === "transferencia") {
        return userAccountNumbers.includes(tx.destinationAccountNumber);
    }
    return false;
};
