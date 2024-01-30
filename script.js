// script.js
function calculateCompounding(initialAmount, interestRate, totalMonths) {
    let monthlyAmounts = [];
    let compoundedAmount = initialAmount;

    for (let month = 0; month < totalMonths; month++) {
        compoundedAmount += initialAmount;
        compoundedAmount *= (1 + (interestRate / 100) / 12);
        monthlyAmounts.push(compoundedAmount);
    }

    return monthlyAmounts;
}

function createChartConfig(title, dataSets) {
    return {
        type: 'line',
        data: {
            labels: Array.from({ length: dataSets[0].length }, (_, i) => `Month ${i + 1}`),
            datasets: dataSets.map((dataSet, index) => ({
                label: title[index],
                data: dataSet,
                fill: false,
                borderColor: `hsl(${index * 120}, 100%, 50%)`,
                tension: 0.1
            }))
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
}

function displayResults() {
    let userAmount = parseFloat(document.getElementById("initialAmount").value);
    let interestRate = parseFloat(document.getElementById("interestRate").value);
    let totalMonths = parseInt(document.getElementById("timePeriod").value);

    if (isNaN(userAmount) || userAmount < 0 || isNaN(interestRate) || interestRate < 0) {
        alert("Please enter valid amounts and rates.");
        return;
    }

    let userCompounding = calculateCompounding(userAmount, interestRate, totalMonths);
    let fasterCompounding = calculateCompounding(userAmount, interestRate * 1.5, totalMonths);
    let slowerCompounding = calculateCompounding(userAmount, interestRate * 0.5, totalMonths);

    const ctx = document.getElementById('compoundingChart').getContext('2d');
    if(window.chart) window.chart.destroy(); // Destroy previous chart

    window.chart = new Chart(ctx, createChartConfig(
        ['Your Investment', '1.5x Rate', '0.5x Rate'],
        [userCompounding, fasterCompounding, slowerCompounding]
    ));
}

document.getElementById("calculateButton").addEventListener("click", displayResults);
