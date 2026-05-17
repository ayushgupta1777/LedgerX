function calculateTopUpInterest(amount, interestRate, startDate, topUpHistory, topDownHistory, interestPaymentHistory = [], today = new Date()) {
  // Create a timeline of all events
  const events = [
    { type: 'start', date: new Date(startDate), amount: amount, rate: interestRate, order: 0 }
  ];

  if (topUpHistory && Array.isArray(topUpHistory)) {
    topUpHistory.forEach(t => {
      events.push({ 
        type: 'topup', 
        date: new Date(t.date), 
        amount: parseFloat(t.amount) || 0, 
        rate: parseFloat(t.topupinterestrate) || interestRate,
        order: 1 
      });
    });
  }

  if (topDownHistory && Array.isArray(topDownHistory)) {
    topDownHistory.forEach(t => {
      events.push({ 
        type: 'repayment', 
        date: new Date(t.date), 
        amount: parseFloat(t.amount) || 0,
        order: 2
      });
    });
  }

  // Sort events by date, then by order for same-day consistency
  events.sort((a, b) => {
    const dateDiff = a.date - b.date;
    if (dateDiff !== 0) return dateDiff;
    return a.order - b.order;
  });

  let totalAccruedInterest = 0;
  let lastDate = events.length > 0 ? events[0].date : new Date(startDate);
  
  // Principal segments: [{ amount, rate }]
  let principalSegments = [];
  let topUpTotal = 0;
  let topdownTotal = 0;

  events.forEach(event => {
    // 1. Calculate interest on all active segments since the last event
    const daysElapsed = Math.floor((event.date - lastDate) / (1000 * 60 * 60 * 24));
    if (daysElapsed > 0 && principalSegments.length > 0) {
      principalSegments.forEach(segment => {
        if (segment.amount > 0) {
          const segmentInterest = segment.amount * (segment.rate / 100 / 30) * daysElapsed;
          totalAccruedInterest += segmentInterest;
        }
      });
    }

    // 2. Apply the current event
    if (event.type === 'start') {
      principalSegments.push({ amount: event.amount, rate: event.rate });
    } else if (event.type === 'topup') {
      principalSegments.push({ amount: event.amount, rate: event.rate });
      topUpTotal += event.amount;
    } else if (event.type === 'repayment') {
      let remainingRepayment = event.amount;
      topdownTotal += event.amount;
      
      // Reduce segments in order (FIFO)
      for (let i = 0; i < principalSegments.length && remainingRepayment > 0; i++) {
        if (principalSegments[i].amount >= remainingRepayment) {
          principalSegments[i].amount -= remainingRepayment;
          remainingRepayment = 0;
        } else {
          remainingRepayment -= principalSegments[i].amount;
          principalSegments[i].amount = 0;
        }
      }
    }
    
    lastDate = event.date;
  });

  // Calculate interest from the last event until today
  const finalDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  if (finalDays > 0 && principalSegments.length > 0) {
    principalSegments.forEach(segment => {
      if (segment.amount > 0) {
        totalAccruedInterest += segment.amount * (segment.rate / 100 / 30) * finalDays;
      }
    });
  }

  // Calculate topdownInterest (interest accrued specifically on top-up amounts for UI if needed)
  // Note: Since everything is unified now, we can calculate this by tracking top-up segments only
  // but for simplicity and backwards compatibility, we'll keep it simple or set it to 0.
  
  // Calculate paid interest
  let paidInterestTotal = 0;
  if (interestPaymentHistory && Array.isArray(interestPaymentHistory)) {
    interestPaymentHistory.forEach(p => {
      paidInterestTotal += parseFloat(p.amount) || 0;
    });
  }

  // Calculate remaining principal
  const currentRemainingPrincipal = principalSegments.reduce((sum, s) => sum + s.amount, 0);

  return {
    topUpInterest: 0, // Simplified: already included in totalInterest
    topUpTotal,
    topdownInterest: 0, 
    topdownTotal, 
    totalInterest: Math.max(0, totalAccruedInterest - paidInterestTotal), 
    remainingPrincipal: currentRemainingPrincipal,
    paidInterestTotal
  };
}

module.exports = { calculateTopUpInterest };
