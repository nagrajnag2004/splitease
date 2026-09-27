/**
 * Debt Simplification Algorithm (Greedy Min Cash Flow)
 *
 * Given a map or list of net user balances (positive = is owed money, negative = owes money),
 * this function minimizes the total number of transactions needed to settle all debts.
 *
 * @param {Array<{ user: Object, netBalance: number }>} userBalances 
 * @returns {Array<{ from: Object, to: Object, amount: number }>} Array of simplified payment transfers
 */
function simplifyDebts(userBalances) {
  // Filter out users with 0 or near-zero balance (< 0.01)
  const EPSILON = 0.001;

  // Separate into debtors (< 0) and creditors (> 0)
  const debtors = [];
  const creditors = [];

  userBalances.forEach(({ user, netBalance }) => {
    const val = Number(netBalance.toFixed(2));
    if (val < -EPSILON) {
      debtors.push({ user, amount: Math.abs(val) });
    } else if (val > EPSILON) {
      creditors.push({ user, amount: val });
    }
  });

  const transactions = [];

  // Sort descending by amount to always pair maximum debtor with maximum creditor
  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const maxDebtor = debtors[0];
    const maxCreditor = creditors[0];

    const settledAmount = Math.min(maxDebtor.amount, maxCreditor.amount);
    const roundedAmount = Number(settledAmount.toFixed(2));

    if (roundedAmount > 0) {
      transactions.push({
        from: maxDebtor.user,
        to: maxCreditor.user,
        amount: roundedAmount
      });
    }

    maxDebtor.amount -= settledAmount;
    maxCreditor.amount -= settledAmount;

    if (maxDebtor.amount < EPSILON) {
      debtors.shift();
    }
    if (maxCreditor.amount < EPSILON) {
      creditors.shift();
    }
  }

  return transactions;
}

module.exports = simplifyDebts;
