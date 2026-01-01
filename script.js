// Toggle mobile menu
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(
    '#menuToggle input[type="checkbox"]'
  );
  const menu = document.querySelector("#menu");

  menuToggle.addEventListener("change", () => {
    const isOpen = menuToggle.checked;
    menu.style.display = isOpen ? "block" : "none";
    menuToggle.setAttribute("aria-expanded", isOpen);
  });
});

// Handle Financial Literacy Quiz submission
document.getElementById("quizForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const questions = {
    q1: "R100 plus three percent",
    q2: "Less",
    q3: "Less",
    q4: "More than R120"
  };
  let score = 0;
  let results = [];

  Object.keys(questions).forEach((key, index) => {
    const selected = document.querySelector(`input[name="${key}"]:checked`);
    const isCorrect = selected && selected.value === questions[key];
    score += isCorrect ? 1 : 0;
    const status = isCorrect ? '<span class="correct">✓ Correct</span>' : '<span class="incorrect">✗ Incorrect</span>';
    const userAnswer = selected ? selected.value : 'Not answered';
    const correctAnswer = questions[key];
    results.push(`<li>Q${index + 1}: ${status} ${isCorrect ? '' : `<br><small>Your answer: ${userAnswer}<br>Correct answer: ${correctAnswer}</small>`}</li>`);
  });

  const percentage = Math.round((score / 4) * 100);
  const resultContainer = document.getElementById("quizResult");
  resultContainer.innerHTML = `
    <h4>Quiz Results</h4>
    <div class="score">${score} out of 4 (${percentage}%)</div>
    <ul>${results.join('')}</ul>
    <p class="muted">${percentage >= 75 ? '🎉 Great job!' : 'Keep learning about financial literacy!'}</p>
  `;
  resultContainer.style.display = 'block';
});
document
  .getElementById("retirementForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    var currentAge = parseInt(document.getElementById("currentAge").value);
    var retirementAge = parseInt(
      document.getElementById("retirementAge").value
    );
    var currentSavings = parseFloat(
      document.getElementById("currentSavings").value
    );
    var monthlyContribution = parseFloat(
      document.getElementById("monthlyContribution").value
    );
    var annualReturn =
      parseFloat(document.getElementById("annualReturn").value) / 100;

    var totalMonths = (retirementAge - currentAge) * 12;
    var futureValue = currentSavings;

    for (var i = 0; i < totalMonths; i++) {
      futureValue += monthlyContribution;
      futureValue *= 1 + annualReturn / 12;
    }

    var resultBox = document.getElementById("retirementResult");
    resultBox.classList.add("show");
    resultBox.innerHTML = `
      <h4>Retirement Projection</h4>
      <div class="result-label">Estimated savings at age ${retirementAge}</div>
      <div class="result-value">R${futureValue.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
      <div class="result-details">
        <div class="detail-item">
          <strong>Current Savings</strong>
          <span>R${currentSavings.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div class="detail-item">
          <strong>Monthly Contribution</strong>
          <span>R${monthlyContribution.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div class="detail-item">
          <strong>Years to Retirement</strong>
          <span>${retirementAge - currentAge} years</span>
        </div>
        <div class="detail-item">
          <strong>Expected Return</strong>
          <span>${(annualReturn * 100).toFixed(2)}% annually</span>
        </div>
      </div>
    `;
  });

document.getElementById("loanForm").addEventListener("submit", function (e) {
  e.preventDefault();

  var loanAmount = parseFloat(document.getElementById("loanAmount").value);
  var loanInterest =
    parseFloat(document.getElementById("loanInterest").value) / 100;
  var loanTerm = parseInt(document.getElementById("loanTerm").value);

  var monthlyInterest = loanInterest / 12;
  var totalPayments = loanTerm * 12;
  var monthlyPayment =
    (loanAmount * monthlyInterest) /
    (1 - Math.pow(1 + monthlyInterest, -totalPayments));
  
  var totalPaid = monthlyPayment * totalPayments;
  var totalInterest = totalPaid - loanAmount;

  var resultBox = document.getElementById("loanResult");
  resultBox.classList.add("show");
  resultBox.innerHTML = `
    <h4>Loan Repayment</h4>
    <div class="result-label">Monthly payment</div>
    <div class="result-value">R${monthlyPayment.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
    <div class="result-details">
      <div class="detail-item">
        <strong>Loan Amount</strong>
        <span>R${loanAmount.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
      </div>
      <div class="detail-item">
        <strong>Total Interest</strong>
        <span>R${totalInterest.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
      </div>
      <div class="detail-item">
        <strong>Total Payments</strong>
        <span>R${totalPaid.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
      </div>
      <div class="detail-item">
        <strong>Loan Term</strong>
        <span>${loanTerm} years (${totalPayments} months)</span>
      </div>
    </div>
  `;
});

document
  .getElementById("interestForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    var principal = parseFloat(document.getElementById("principal").value);
    var rate = parseFloat(document.getElementById("rate").value) / 100;
    var time = parseFloat(document.getElementById("time").value);
    var compound = parseInt(document.getElementById("compound").value);

    var values = [];
    for (let year = 1; year <= time; year++) {
      var amount = principal * Math.pow(1 + rate / compound, compound * year);
      values.push(amount);
    }

    var finalAmount = values[values.length - 1];
    var totalInterest = finalAmount - principal;

    // Show result box
    var resultBox = document.getElementById("interestResult");
    resultBox.classList.add("show");
    resultBox.innerHTML = `
      <h4>Compound Interest Result</h4>
      <div class="result-label">Final amount after ${time} years</div>
      <div class="result-value">R${finalAmount.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
      <div class="result-details">
        <div class="detail-item">
          <strong>Principal</strong>
          <span>R${principal.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div class="detail-item">
          <strong>Interest Earned</strong>
          <span>R${totalInterest.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
        </div>
        <div class="detail-item">
          <strong>Annual Rate</strong>
          <span>${(rate * 100).toFixed(2)}%</span>
        </div>
        <div class="detail-item">
          <strong>Compounding</strong>
          <span>${['Annually','Semi-Annually','Quarterly','Monthly'][compound.toString().indexOf('1') === 0 ? 0 : compound.toString().indexOf('2') === 0 ? 1 : compound.toString().indexOf('4') === 0 ? 2 : 3]}</span>
        </div>
      </div>
    `;

    // Render chart
    var ctx = document.getElementById("chartContainer").getContext("2d");
    if (window.investmentChart) {
      window.investmentChart.destroy();
    }
    window.investmentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: time }, (_, i) => `Year ${i + 1}`),
        datasets: [
          {
            label: "Investment Growth",
            data: values,
            backgroundColor: "rgba(28,135,201,0.1)",
            borderColor: "rgba(28,135,201,1)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgba(28,135,201,1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "var(--text)",
              font: { size: 12 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R' + value.toLocaleString('en-ZA', {maximumFractionDigits:0});
              }
            }
          }
        }
      }
    });
  });
// Smart Financial Advisor
document.getElementById("advisorForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const income = parseFloat(document.getElementById("annualIncome").value);
  const expenses = parseFloat(document.getElementById("monthlyExpenses").value);
  const age = parseInt(document.getElementById("advAge").value);
  const debt = parseFloat(document.getElementById("currentDebt").value);
  const emergency = parseFloat(document.getElementById("emergencyFund").value);
  const investYears = parseInt(document.getElementById("investmentGoal").value);

  // Calculate metrics
  const monthlyIncome = income / 12;
  const savingsRate = ((monthlyIncome - expenses) / monthlyIncome) * 100;
  const debtToIncome = (debt / income) * 100;
  const emergencyMonths = emergency / expenses;

  // Financial Health Score (0-100)
  let healthScore = 50;
  healthScore += Math.min(25, (savingsRate / 20) * 10); // Savings rate (max +25)
  healthScore -= Math.min(20, (debtToIncome / 50) * 20); // Debt impact (max -20)
  healthScore += Math.min(15, (emergencyMonths / 6) * 15); // Emergency fund (max +15)

  // Determine risk profile based on age and debt
  let riskProfile = "Conservative";
  let stockAllocation = 40;
  let bondAllocation = 40;
  let cashAllocation = 20;

  if (age < 35 && debtToIncome < 40) {
    riskProfile = "Aggressive";
    stockAllocation = 70;
    bondAllocation = 20;
    cashAllocation = 10;
  } else if (age < 50 && debtToIncome < 50) {
    riskProfile = "Moderate";
    stockAllocation = 60;
    bondAllocation = 30;
    cashAllocation = 10;
  } else if (age > 55) {
    riskProfile = "Conservative";
    stockAllocation = 35;
    bondAllocation = 50;
    cashAllocation = 15;
  }

  // Recommendations
  let recommendations = [];
  if (savingsRate < 10) recommendations.push("Increase savings rate - aim for 15-20% of income");
  if (debtToIncome > 50) recommendations.push("Prioritize debt reduction before investing");
  if (emergencyMonths < 3) recommendations.push("Build emergency fund to 3-6 months of expenses");
  if (savingsRate >= 15) recommendations.push("✓ Good savings rate! Consider investing excess");

  const resultContainer = document.getElementById("advisorResult");
  resultContainer.innerHTML = `
    <h4>Your Financial Health Score</h4>
    <div class="score" style="font-size: 2.5rem; color: var(--accent); margin: 16px 0;">${Math.round(healthScore)}/100</div>
    
    <div class="result-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0;">
      <div class="detail-item">
        <strong>Savings Rate</strong>
        <span>${savingsRate.toFixed(1)}%</span>
      </div>
      <div class="detail-item">
        <strong>Debt-to-Income</strong>
        <span>${debtToIncome.toFixed(1)}%</span>
      </div>
      <div class="detail-item">
        <strong>Emergency Fund</strong>
        <span>${emergencyMonths.toFixed(1)} months</span>
      </div>
      <div class="detail-item">
        <strong>Risk Profile</strong>
        <span>${riskProfile}</span>
      </div>
    </div>

    <h4 style="margin-top: 24px;">Recommended Asset Allocation</h4>
    ${StockDataModule.createPortfolioDisplay({
      stocks: stockAllocation,
      bonds: bondAllocation,
      cash: cashAllocation
    })}

    <h4 style="margin-top: 24px;">Smart Recommendations</h4>
    <ul>
      ${recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
  `;
  resultContainer.classList.add('show');
});