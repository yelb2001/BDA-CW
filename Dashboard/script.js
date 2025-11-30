// 1) Most precipitous season by district
new Chart(document.getElementById('chartMostPrecip'), {
  type: 'bar',
  data: {
    labels: ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'],
    datasets: [
      { label: 'Colombo', data: [180, 220, 260, 300] },
      { label: 'Gampaha', data: [150, 210, 240, 280] },
      { label: 'Kandy',   data: [120, 160, 190, 230] }
    ]
  }
});

// 2) Top 5 districts by total precipitation
new Chart(document.getElementById('chartTopDistricts'), {
  type: 'doughnut',
  data: {
    labels: ['Colombo', 'Gampaha', 'Kandy', 'Matara', 'Jaffna'],
    datasets: [{ data: [4200, 1950, 1200, 880, 400] }]
  }
});

// 3) % of months with mean temp > 30°C
new Chart(document.getElementById('chartHotMonths'), {
  type: 'bar',
  data: {
    labels: ['2020', '2021', '2022', '2023'],
    datasets: [{ data: [25, 33, 50, 42], label: '% months > 30°C' }]
  },
  options: { plugins: { legend: { display: false } } }
});

// 4) Extreme weather days
const extremeDaysPerYear = [10, 15, 8, 20, 18];
const totalExtremeDays = extremeDaysPerYear.reduce((a, b) => a + b, 0);
document.getElementById('extremeDaysValue').textContent = totalExtremeDays;

new Chart(document.getElementById('chartExtremeDays'), {
  type: 'line',
  data: {
    labels: ['2019', '2020', '2021', '2022', '2023'],
    datasets: [{ data: extremeDaysPerYear, label: 'Extreme days', tension: 0.3 }]
  },
  options: { plugins: { legend: { display: false } } }
});
