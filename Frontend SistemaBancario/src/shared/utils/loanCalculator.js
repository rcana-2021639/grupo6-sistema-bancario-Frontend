/**
 * Helper functions for loan calculations
 */

/**
 * Calculate monthly payment for a loan
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal, e.g. 0.05 for 5%)
 * @param {number} termMonths - Term in months
 * @returns {number} Monthly payment
 */
export const calculateMonthlyPayment = (principal, annualInterestRate, termMonths) => {
  if (annualInterestRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualInterestRate / 12;
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
};

/**
 * Generate payment schedule for a loan
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @param {number} termMonths - Term in months
 * @param {Date} startDate - Start date of the loan
 * @returns {Array} Array of payment objects
 */
export const generatePaymentSchedule = (principal, annualInterestRate, termMonths, startDate = new Date()) => {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths);
  const monthlyRate = annualInterestRate / 12;

  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= termMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;

    // Ensure balance doesn't go negative due to rounding
    if (balance < 0) balance = 0;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + month);

    schedule.push({
      month,
      paymentDate,
      monthlyPayment,
      principalPayment,
      interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
};

/**
 * Calculate total interest paid over the life of the loan
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @param {number} termMonths - Term in months
 * @returns {number} Total interest
 */
export const calculateTotalInterest = (principal, annualInterestRate, termMonths) => {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths);
  const totalPaid = monthlyPayment * termMonths;
  return totalPaid - principal;
};

/**
 * Calculate total amount paid (principal + interest)
 * @param {number} principal - Loan amount
 * @param {number} annualInterestRate - Annual interest rate (as decimal)
 * @param {number} termMonths - Term in months
 * @returns {number} Total amount paid
 */
export const calculateTotalAmount = (principal, annualInterestRate, termMonths) => {
  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, termMonths);
  return monthlyPayment * termMonths;
};