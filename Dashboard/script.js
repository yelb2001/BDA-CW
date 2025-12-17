// CHART CONFIGURATION - Global settings for all charts

Chart.defaults.color = '#cbd5e1';
Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.2)';
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// QUESTION 1: Most Precipitous Month per District

// Month color mapping for visual patterns
const monthColors = {
  'January': '#3b82f6', 'February': '#60a5fa', 'March': '#93c5fd',
  'April': '#86efac', 'May': '#22c55e', 'June': '#10b981',
  'July': '#fbbf24', 'August': '#fb923c', 'September': '#f97316',
  'October': '#8b5cf6', 'November': '#a78bfa', 'December': '#c4b5fd'
};

// Data: Each district's wettest month (aggregated across all years) - REAL DATA
const q1Data = [
  { district: 'Ratnapura', wettestMonth: 'October', avgPrecipitation: 16.2 },
  { district: 'Kegalle', wettestMonth: 'October', avgPrecipitation: 13.2 },
  { district: 'Nuwara Eliya', wettestMonth: 'October', avgPrecipitation: 13.2 },
  { district: 'Matale', wettestMonth: 'October', avgPrecipitation: 13.1 },
  { district: 'Gampaha', wettestMonth: 'October', avgPrecipitation: 12.6 },
  { district: 'Kurunegala', wettestMonth: 'October', avgPrecipitation: 12.6 },
  { district: 'Colombo', wettestMonth: 'November', avgPrecipitation: 12.5 },
  { district: 'Bandarawela', wettestMonth: 'October', avgPrecipitation: 12.2 },
  { district: 'Kandy', wettestMonth: 'October', avgPrecipitation: 12.2 },
  { district: 'Kalutara', wettestMonth: 'October', avgPrecipitation: 12.0 },
  { district: 'Galle', wettestMonth: 'November', avgPrecipitation: 11.6 },
  { district: 'Badulla', wettestMonth: 'November', avgPrecipitation: 11.4 },
  { district: 'Welimada', wettestMonth: 'October', avgPrecipitation: 11.4 },
  { district: 'Batticaloa', wettestMonth: 'December', avgPrecipitation: 11.3 },
  { district: 'Moneragala', wettestMonth: 'November', avgPrecipitation: 11.1 }
];

// Create horizontal bar chart
new Chart(document.getElementById('chartMostPrecip'), {
  type: 'bar',
  data: {
    labels: q1Data.map(d => `${d.district} (${d.wettestMonth})`),
    datasets: [{
      label: 'Average Precipitation (mm)',
      data: q1Data.map(d => d.avgPrecipitation),
      backgroundColor: q1Data.map(d => monthColors[d.wettestMonth]),
      borderWidth: 0,
      borderRadius: 4
    }]
  },
  options: {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const district = q1Data[context.dataIndex];
            return `Average: ${district.avgPrecipitation} mm`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Precipitation (mm)',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 }
        }
      }
    }
  }
});

// ============================================================
// QUESTION 2: Top 5 Districts by Total Precipitation (2023)
// ============================================================

// REAL DATA from 2023
const q2Data = [
  { rank: 1, district: 'Ratnapura', total: 5358, province: 'Sabaragamuwa' },
  { rank: 2, district: 'Gampaha', total: 3563, province: 'Western' },
  { rank: 3, district: 'Kalutara', total: 3531, province: 'Western' },
  { rank: 4, district: 'Galle', total: 3481, province: 'Southern' },
  { rank: 5, district: 'Colombo', total: 3468, province: 'Western' }
];

// Create Doughnut Chart
new Chart(document.getElementById('chartTopDistricts'), {
  type: 'doughnut',
  data: {
    labels: q2Data.map(d => d.district),
    datasets: [{
      data: q2Data.map(d => d.total),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue - Colombo
        'rgba(139, 92, 246, 0.8)',   // Purple - Gampaha
        'rgba(236, 72, 153, 0.8)',   // Pink - Kandy
        'rgba(34, 197, 94, 0.8)',    // Green - Galle
        'rgba(251, 146, 60, 0.8)'    // Orange - Matara
      ],
      borderColor: '#0f172a',
      borderWidth: 3
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 12,
          font: { size: 11 },
          generateLabels: function(chart) {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} (${(data.datasets[0].data[i] / 1000).toFixed(1)}k mm)`,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed.toLocaleString()} mm (${percentage}%)`;
          }
        }
      }
    }
  }
});

// Populate Table
const tableBody = document.getElementById('topDistrictsTable');
q2Data.forEach(item => {
  const row = document.createElement('tr');
  const total = q2Data.reduce((sum, d) => sum + d.total, 0);
  const percentage = ((item.total / total) * 100).toFixed(1);

  row.innerHTML = `
    <td><span class="rank-badge rank-${item.rank}">${item.rank}</span></td>
    <td><strong>${item.district}</strong></td>
    <td>${item.total.toLocaleString()} mm</td>
    <td>${item.province}</td>
  `;
  tableBody.appendChild(row);
});

// ============================================================
// QUESTION 3: Percentage of Months with Temp > 30°C (2023)
// ============================================================

// REAL DATA from 2023 - averaged across all districts
const q3Data = {
  year: 2023,
  monthlyData: [
    { month: 'Jan', avgTemp: 23.6, isHot: false },
    { month: 'Feb', avgTemp: 24.2, isHot: false },
    { month: 'Mar', avgTemp: 25.4, isHot: false },
    { month: 'Apr', avgTemp: 26.4, isHot: false },
    { month: 'May', avgTemp: 26.6, isHot: false },
    { month: 'Jun', avgTemp: 27.1, isHot: false },
    { month: 'Jul', avgTemp: 26.8, isHot: false },
    { month: 'Aug', avgTemp: 27.3, isHot: false },
    { month: 'Sep', avgTemp: 25.9, isHot: false },
    { month: 'Oct', avgTemp: 25.0, isHot: false },
    { month: 'Nov', avgTemp: 24.6, isHot: false },
    { month: 'Dec', avgTemp: 24.7, isHot: false }
  ],
  hotMonthsCount: 0,
  totalMonths: 12,
  percentage: 0.0
};

// Create bar chart with conditional coloring
new Chart(document.getElementById('chartHotMonths'), {
  type: 'bar',
  data: {
    labels: q3Data.monthlyData.map(d => d.month),
    datasets: [{
      label: 'Average Temperature (°C)',
      data: q3Data.monthlyData.map(d => d.avgTemp),
      backgroundColor: q3Data.monthlyData.map(d =>
        d.isHot ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)'
      ),
      borderColor: q3Data.monthlyData.map(d =>
        d.isHot ? 'rgba(239, 68, 68, 1)' : 'rgba(59, 130, 246, 1)'
      ),
      borderWidth: 2,
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const temp = context.parsed.y.toFixed(1);
            const status = context.parsed.y > 30 ? '(Hot Month)' : '(Normal)';
            return `${temp}°C ${status}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 35,
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          callback: function(value) {
            return value + '°C';
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }
});

// Update KPI values for Q3
document.querySelector('.card:nth-child(3) .kpi-item:nth-child(1) .kpi-value').textContent = q3Data.hotMonthsCount + ' / ' + q3Data.totalMonths;
document.querySelector('.card:nth-child(3) .kpi-item:nth-child(1) .kpi-detail').textContent = 'months > 30°C';
document.querySelector('.card:nth-child(3) .kpi-item:nth-child(2) .kpi-value').textContent = q3Data.percentage + '%';
document.querySelector('.card:nth-child(3) .kpi-item:nth-child(2) .kpi-detail').textContent = `Year ${q3Data.year}`;

// ============================================================
// QUESTION 4: Extreme Weather Events (Dual Charts)
// ============================================================

// REAL DATA - Extreme weather events (precip > 15mm AND wind gusts > 40 km/h)
const q4Data = {
  total: 3529,
  mostAffected: { district: 'Galle', count: 322 },
  yearlyTrend: [
    { year: 2010, days: 256 },
    { year: 2011, days: 297 },
    { year: 2012, days: 177 },
    { year: 2013, days: 230 },
    { year: 2014, days: 179 },
    { year: 2015, days: 99 },
    { year: 2016, days: 133 },
    { year: 2017, days: 347 },
    { year: 2018, days: 242 },
    { year: 2019, days: 246 },
    { year: 2020, days: 317 },
    { year: 2021, days: 347 },
    { year: 2022, days: 284 },
    { year: 2023, days: 243 },
    { year: 2024, days: 132 }
  ],
  topDistricts: [
    { district: 'Galle', days: 322 },
    { district: 'Kalutara', days: 299 },
    { district: 'Colombo', days: 295 },
    { district: 'Gampaha', days: 269 },
    { district: 'Ratnapura', days: 259 },
    { district: 'Nuwara Eliya', days: 237 },
    { district: 'Kegalle', days: 201 },
    { district: 'Matara', days: 163 },
    { district: 'Mullaitivu', days: 129 },
    { district: 'Matale', days: 126 }
  ]
};

// Update KPI values
document.getElementById('extremeDaysValue').textContent = q4Data.total.toLocaleString();
document.querySelector('.card:nth-child(4) .kpi-item:nth-child(2) .kpi-value').textContent = q4Data.mostAffected.district;
document.querySelector('.card:nth-child(4) .kpi-item:nth-child(2) .kpi-detail').textContent = q4Data.mostAffected.count + ' extreme days';

// Chart 1: Yearly Trend (Line Chart)
new Chart(document.getElementById('chartExtremeTrend'), {
  type: 'line',
  data: {
    labels: q4Data.yearlyTrend.map(d => d.year),
    datasets: [{
      label: 'Extreme Weather Days',
      data: q4Data.yearlyTrend.map(d => d.days),
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(245, 158, 11, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} extreme days`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Days',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }
});

// Chart 2: Top Districts (Horizontal Bar Chart)
new Chart(document.getElementById('chartExtremeDistricts'), {
  type: 'bar',
  data: {
    labels: q4Data.topDistricts.map(d => d.district),
    datasets: [{
      label: 'Extreme Days',
      data: q4Data.topDistricts.map(d => d.days),
      backgroundColor: 'rgba(245, 158, 11, 0.7)',
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  },
  options: {
    indexAxis: 'y', // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.x} extreme weather days`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Days',
          color: '#94a3b8'
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 }
        }
      }
    }
  }
});

// ============================================================
// ADDITIONAL UX ENHANCEMENTS
// ============================================================

// Add loading animation completion
document.addEventListener('DOMContentLoaded', function() {
  // Fade in cards sequentially
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });

  // Console log for debugging
  console.log('✅ Weather Dashboard loaded successfully');
  console.log(`📊 Total extreme weather days (2010-2024): ${q4Data.total}`);
  console.log(`🌧️ Top district for extreme events: ${q4Data.mostAffected.district} (${q4Data.mostAffected.count} days)`);
  console.log(`🌡️ Hot months in ${q3Data.year}: ${q3Data.hotMonthsCount} out of ${q3Data.totalMonths} (${q3Data.percentage}%)`);
});
