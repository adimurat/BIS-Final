// script.js

let budget = 0;
let totalExpenses = 0;
let expenseCategories = {};
let recurringExpenses = [];
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || { budget: 0, expenses: [], categories: {}, recurring: [] };

// Modal Elements
const expenseModal = document.getElementById('expense-modal');
const closeModalButton = document.getElementById('close-modal');
const expenseForm = document.getElementById('expense-form');

// Load saved data into UI
function loadData() {
    budget = expenseData.budget;
    totalExpenses = expenseData.expenses.reduce((acc, expense) => acc + expense.amount, 0);

    document.getElementById('budget-amount').innerText = budget;
    document.getElementById('total-expenses').innerText = totalExpenses;
    document.getElementById('remaining-budget').innerText = budget - totalExpenses;

    // Update expense categories
    const categoriesElement = document.getElementById('categories');
    categoriesElement.innerHTML = '';
    for (let category in expenseData.categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('category-item');
        categoryDiv.innerText = `${category}: $${expenseData.categories[category]}`;
        categoryDiv.addEventListener('click', () => editCategory(category));
        categoriesElement.appendChild(categoryDiv);
    }

    // Update expense chart
    updateExpenseChart();
}

// Update expense chart
function updateExpenseChart() {
    const chartData = {
        labels: Object.keys(expenseData.categories),
        datasets: [{
            label: 'Expenses by Category',
            data: Object.values(expenseData.categories),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    if (window.expenseChart) {
        window.expenseChart.data = chartData;
        window.expenseChart.update();
    } else {
        window.expenseChart = new Chart(document.getElementById('expense-chart'), {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }});
    }
}

// Open modal to add expense
document.getElementById('add-expense').addEventListener('click', function() {
    expenseModal.style.display = 'flex';
});

// Close modal
closeModalButton.addEventListener('click', function() {
    expenseModal.style.display = 'none';
});

// Add new expense
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const expenseAmount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;

    if (isNaN(expenseAmount) || expenseAmount <= 0 || !category) {
        alert("Please enter valid values.");
        return;
    }

    if (!expenseData.categories[category]) {
        expenseData.categories[category] = 0;
    }

    expenseData.expenses.push({ amount: expenseAmount, category });
    expenseData.categories[category] += expenseAmount;

    totalExpenses += expenseAmount;
    loadData();
    saveData();

    // Budget Alert
    if (totalExpenses > budget * 0.9) {
        alert("Warning: You are close to exceeding your budget!");
    }

    expenseModal.style.display = 'none';
});

// Edit Category
function editCategory(category) {
    const newAmount = prompt("Enter new amount for " + category + ":");
    if (isNaN(newAmount) || newAmount < 0) {
        alert("Invalid amount.");
        return;
    }

    const difference = newAmount - expenseData.categories[category];
    expenseData.categories[category] = newAmount;

    expenseData.expenses.forEach(expense => {
        if (expense.category === category) {
            expense.amount += difference;
        }
    });

    totalExpenses += difference;
    loadData();
    saveData();
}

// Set Budget
document.getElementById('set-budget').addEventListener('click', function() {
    let userBudget = parseFloat(prompt("Set your monthly budget:"));
    if (isNaN(userBudget) || userBudget <= 0) {
        alert("Please enter a valid number.");
        return;
    }
    expenseData.budget = userBudget;
    loadData();
    saveData();
});

// Save data to localStorage
function saveData() {
    localStorage.setItem('expenseData', JSON.stringify(expenseData));
}

// Load initial data
loadData();
