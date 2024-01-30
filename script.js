// Toggle mobile menu
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('#menuToggle input[type="checkbox"]');
    const menu = document.querySelector('#menu');

    menuToggle.addEventListener('change', () => {
        const isOpen = menuToggle.checked;
        menu.style.display = isOpen ? 'block' : 'none';
        menuToggle.setAttribute('aria-expanded', isOpen);
    });
});

// Handle Financial Literacy Quiz submission
document.getElementById('quizForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const questions = {
        q1: 'R100 plus three percent',
        q2: 'The same',
        q3: 'More',
        q4: 'More than R150'
    };
    let score = 0;
    let results = [];

    Object.keys(questions).forEach((key, index) => {
        const selected = document.querySelector(`input[name="${key}"]:checked`);
        const isCorrect = selected && selected.value === questions[key];
        score += isCorrect ? 1 : 0;
        results.push(`Question ${index + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    });

    const resultContainer = document.getElementById('quizResult');
    resultContainer.innerHTML = `<p>Your Score: ${score} out of 4</p><ul>${results.map(r => `<li>${r}</li>`).join('')}</ul>`;
});
document.getElementById('retirementForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var currentAge = parseInt(document.getElementById('currentAge').value);
    var retirementAge = parseInt(document.getElementById('retirementAge').value);
    var currentSavings = parseFloat(document.getElementById('currentSavings').value);
    var monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
    var annualReturn = parseFloat(document.getElementById('annualReturn').value) / 100;

    var totalMonths = (retirementAge - currentAge) * 12;
    var futureValue = currentSavings;

    for (var i = 0; i < totalMonths; i++) {
        futureValue += monthlyContribution;
        futureValue *= (1 + annualReturn / 12);
    }

    document.getElementById('retirementResult').innerText = 'At retirement, your savings could be: $' + futureValue.toFixed(2);
});

document.getElementById('loanForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var loanAmount = parseFloat(document.getElementById('loanAmount').value);
    var loanInterest = parseFloat(document.getElementById('loanInterest').value) / 100;
    var loanTerm = parseInt(document.getElementById('loanTerm').value);

    var monthlyInterest = loanInterest / 12;
    var totalPayments = loanTerm * 12;
    var monthlyPayment = loanAmount * monthlyInterest / (1 - Math.pow(1 + monthlyInterest, -totalPayments));

    document.getElementById('loanResult').innerText = 'Your monthly payment: $' + monthlyPayment.toFixed(2);
});


document.getElementById('interestForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var principal = parseFloat(document.getElementById('principal').value);
    var rate = parseFloat(document.getElementById('rate').value) / 100;
    var time = parseFloat(document.getElementById('time').value);
    var compound = parseInt(document.getElementById('compound').value);

    var values = [];
    for (let year = 1; year <= time; year++) {
        var amount = principal *
    Math.pow((1 + rate / compound), compound * year);
        values.push(amount);
    }

    var ctx = document.getElementById('chartContainer').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: time}, (_, i) => i + 1),
            datasets: [{
                label: 'Investment Over Time',
                data: values,
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});
