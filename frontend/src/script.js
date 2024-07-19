document
  .getElementById("fetch-transactions")
  .addEventListener("click", fetchTransactions);
document
  .getElementById("fetch-statistics")
  .addEventListener("click", fetchStatistics);
document
  .getElementById("fetch-bar-chart")
  .addEventListener("click", fetchBarChart);

async function fetchTransactions() {
  const month = document.getElementById("month-select").value;
  const search = document.getElementById("search-input").value;
  try {
    const response = await fetch(
      `http://localhost:5000/api/transactions?month=${month}&search=${search}`
    );
    const transactions = await response.json();
    displayTransactions(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
}

function displayTransactions(transactions) {
  const tbody = document.querySelector("#transactions-table tbody");
  tbody.innerHTML = ""; // Clear previous rows
  transactions.forEach((transaction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${transaction.title}</td>
      <td>${transaction.description}</td>
      <td>${transaction.price}</td>
      <td>${new Date(transaction.dateOfSale).toLocaleDateString()}</td>
      <td>${transaction.sold ? "Yes" : "No"}</td>
    `;
    tbody.appendChild(row);
  });
}

async function fetchStatistics() {
  const month = document.getElementById("month-select").value;
  try {
    const response = await fetch(
      `http://localhost:5000/api/statistics?month=${month}`
    );
    const statistics = await response.json();
    displayStatistics(statistics);
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }
}

function displayStatistics(statistics) {
  document.getElementById(
    "total-sale-amount"
  ).textContent = `$${statistics.totalSaleAmount}`;
  document.getElementById("total-sold-items").textContent =
    statistics.totalSoldItems;
  document.getElementById("total-not-sold-items").textContent =
    statistics.totalNotSoldItems;
}

async function fetchBarChart() {
  const month = document.getElementById("month-select").value;
  try {
    const response = await fetch(
      `http://localhost:5000/api/bar-chart?month=${month}`
    );
    const barChartData = await response.json();
    displayBarChart(barChartData);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
  }
}

function displayBarChart(data) {
  const barChartDiv = document.getElementById("bar-chart");
  barChartDiv.innerHTML = ""; // Clear previous chart
  data.forEach((item) => {
    const barItem = document.createElement("div");
    barItem.innerHTML = `${item.range}: ${item.count}`;
    barChartDiv.appendChild(barItem);
  });
}
