import Chart from 'chart.js/auto';

// Toggle mobile menu
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle') as HTMLButtonElement | null;
  const menu = document.getElementById('menu') as HTMLElement | null;

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (!menu) return;
      const isOpen = menu.style.display === 'block';
      menu.style.display = isOpen ? 'none' : 'block';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
    });
  }

  // Quiz form
  const quizForm = document.getElementById('quizForm') as HTMLFormElement | null;
  if (quizForm) {
    quizForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const questions: Record<string, string> = {
        q1: 'R100 plus three percent',
        q2: 'The same',
        q3: 'More',
        q4: 'More than R150'
      };
      let score = 0;
      const results: string[] = [];

      Object.keys(questions).forEach((key, index) => {
        const selected = document.querySelector<HTMLInputElement>(`input[name="${key}"]:checked`);
        const isCorrect = selected && selected.value === questions[key];
        score += isCorrect ? 1 : 0;
        results.push(`Question ${index + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`);
      });

      const resultContainer = document.getElementById('quizResult');
      if (resultContainer) {
        resultContainer.innerHTML = `<p>Your Score: ${score} out of 4</p><ul>${results
          .map((r) => `<li>${r}</li>`)
          .join('')}</ul>`;
      }
    });
  }

  // Retirement form
  const retirementForm = document.getElementById('retirementForm') as HTMLFormElement | null;
  if (retirementForm) {
    retirementForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentAge = parseInt((document.getElementById('currentAge') as HTMLInputElement).value || '0', 10);
      const retirementAge = parseInt((document.getElementById('retirementAge') as HTMLInputElement).value || '0', 10);
      const currentSavings = parseFloat((document.getElementById('currentSavings') as HTMLInputElement).value || '0');
      const monthlyContribution = parseFloat((document.getElementById('monthlyContribution') as HTMLInputElement).value || '0');
      const annualReturn = parseFloat((document.getElementById('annualReturn') as HTMLInputElement).value || '0') / 100;

      const totalMonths = (retirementAge - currentAge) * 12;
      let futureValue = currentSavings;

      for (let i = 0; i < totalMonths; i++) {
        futureValue += monthlyContribution;
        futureValue *= 1 + annualReturn / 12;
      }

      const retirementResult = document.getElementById('retirementResult');
      if (retirementResult) {
        retirementResult.innerText = `At retirement, your savings could be: $${futureValue.toFixed(2)}`;
      }
    });
  }

  // Loan form
  const loanForm = document.getElementById('loanForm') as HTMLFormElement | null;
  if (loanForm) {
    loanForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const loanAmount = parseFloat(((document.getElementById('loanAmount') as HTMLInputElement).value) || '0');
      const loanInterest = parseFloat(((document.getElementById('loanInterest') as HTMLInputElement).value) || '0') / 100;
      const loanTerm = parseInt(((document.getElementById('loanTerm') as HTMLInputElement).value) || '0', 10);

      const monthlyInterest = loanInterest / 12;
      const totalPayments = loanTerm * 12;
      const monthlyPayment =
        (loanAmount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -totalPayments));

      const loanResult = document.getElementById('loanResult');
      if (loanResult) loanResult.innerText = `Your monthly payment: $${monthlyPayment.toFixed(2)}`;
    });
  }

  // Interest form and chart
  const interestForm = document.getElementById('interestForm') as HTMLFormElement | null;
  if (interestForm) {
    interestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const principal = parseFloat(((document.getElementById('principal') as HTMLInputElement).value) || '0');
      const rate = parseFloat(((document.getElementById('rate') as HTMLInputElement).value) || '0') / 100;
      const time = parseInt(((document.getElementById('time') as HTMLInputElement).value) || '0', 10);
      const compound = parseInt(((document.getElementById('compound') as HTMLInputElement).value) || '1', 10);

      const values: number[] = [];
      for (let year = 1; year <= time; year++) {
        const amount = principal * Math.pow(1 + rate / compound, compound * year);
        values.push(amount);
      }

      const canvas = document.getElementById('chartContainer') as HTMLCanvasElement | null;
      if (!canvas) return;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (!ctx) return;

      // destroy previous chart instance attached to canvas dataset if exists
      // @ts-ignore
      if ((canvas as any)._chartInstance) {
        // @ts-ignore
        (canvas as any)._chartInstance.destroy();
      }

      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Array.from({ length: time }, (_, i) => i + 1),
          datasets: [
            {
              label: 'Investment Over Time',
              data: values,
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
              borderColor: 'rgba(0, 123, 255, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });

      // store reference to allow destroy on next render
      // @ts-ignore
      (canvas as any)._chartInstance = chart;
    });
  }

});
