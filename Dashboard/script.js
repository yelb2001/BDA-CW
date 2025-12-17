// CHART CONFIGURATION - Global settings for all charts

Chart.defaults.color = '#cbd5e1';
Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.2)';
Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ============================================================
// QUESTION 1: Most Precipitous Month per District
// ============================================================

// Month color mapping for visual patterns
const monthColors = {
  'January': '#3b82f6', 'February': '#60a5fa', 'March': '#93c5fd',
  'April': '#86efac', 'May': '#22c55e', 'June': '#10b981',
  'July': '#fbbf24', 'August': '#fb923c', 'September': '#f97316',
  'October': '#8b5cf6', 'November': '#a78bfa', 'December': '#c4b5fd'
};

// Data: Each district's wettest month (aggregated across all years)
const q1Data = [
  { district: 'Colombo', wettestMonth: 'October', avgPrecipitation: 350 },
  { district: 'Gampaha', wettestMonth: 'November', avgPrecipitation: 320 },
  { district: 'Kandy', wettestMonth: 'October', avgPrecipitation: 295 },
  { district: 'Galle', wettestMonth: 'October', avgPrecipitation: 285 },
  { district: 'Matara', wettestMonth: 'November', avgPrecipitation: 275 },
  { district: 'Nuwara Eliya', wettestMonth: 'October', avgPrecipitation: 268 },
  { district: 'Kalutara', wettestMonth: 'May', avgPrecipitation: 255 },
  { district: 'Ratnapura', wettestMonth: 'May', avgPrecipitation: 245 },
  { district: 'Kurunegala', wettestMonth: 'October', avgPrecipitation: 230 },
  { district: 'Batticaloa', wettestMonth: 'November', avgPrecipitation: 220 },
  { district: 'Trincomalee', wettestMonth: 'November', avgPrecipitation: 210 },
  { district: 'Anuradhapura', wettestMonth: 'October', avgPrecipitation: 195 },
  { district: 'Jaffna', wettestMonth: 'November', avgPrecipitation: 180 },
  { district: 'Mannar', wettestMonth: 'October', avgPrecipitation: 165 },
  { district: 'Vavuniya', wettestMonth: 'November', avgPrecipitation: 155 }
];

// Create horizontal bar chart
new Chart(document.getElementById('chartMostPrecip'), {
  type: 'bar',
  data: {
    labels: q1Data.map(d => d.district),
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
          title: (items) => q1Data[items[0].dataIndex].district,
          label: (context) => {
            const district = q1Data[context.dataIndex];
            return [
              `Wettest Month: ${district.wettestMonth}`,
              `Average: ${district.avgPrecipitation} mm`
            ];
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

// Generate dynamic insight for Q1
const monthCounts = {};
q1Data.forEach(d => {
  monthCounts[d.wettestMonth] = (monthCounts[d.wettestMonth] || 0) + 1;
});
const topMonth = Object.keys(monthCounts).sort((a,b) => monthCounts[b] - monthCounts[a])[0];
const insightText = `${monthCounts[topMonth]} out of ${q1Data.length} districts have their wettest month in ${topMonth}, coinciding with the Northeast Monsoon season.`;

// Update insight if element exists
const q1InsightElement = document.querySelector('.card:nth-child(1) .insight');
if (q1InsightElement) {
  q1InsightElement.innerHTML = `<strong>Key Insight:</strong> ${insightText}`;
}

// ============================================================
// QUESTION 2: Top 5 Districts by Total Precipitation (2023)
// ============================================================

const q2Data = [
  { rank: 1, district: 'Colombo', total: 3240, province: 'Western' },
  { rank: 2, district: 'Gampaha', total: 3050, province: 'Western' },
  { rank: 3, district: 'Kandy', total: 2890, province: 'Central' },
  { rank: 4, district: 'Galle', total: 2760, province: 'Southern' },
  { rank: 5, district: 'Matara', total: 2580, province: 'Southern' }
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

const q3Data = {
  year: 2023,
  monthlyData: [
    { month: 'Jan', avgTemp: 26.2, isHot: false },
    { month: 'Feb', avgTemp: 27.8, isHot: false },
    { month: 'Mar', avgTemp: 30.5, isHot: true },
    { month: 'Apr', avgTemp: 31.8, isHot: true },
    { month: 'May', avgTemp: 32.4, isHot: true },
    { month: 'Jun', avgTemp: 31.2, isHot: true },
    { month: 'Jul', avgTemp: 30.9, isHot: true },
    { month: 'Aug', avgTemp: 29.8, isHot: false },
    { month: 'Sep', avgTemp: 28.9, isHot: false },
    { month: 'Oct', avgTemp: 27.6, isHot: false },
    { month: 'Nov', avgTemp: 26.8, isHot: false },
    { month: 'Dec', avgTemp: 25.9, isHot: false }
  ],
  hotMonthsCount: 5,
  totalMonths: 12,
  percentage: 41.7
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

const q4Data = {
  total: 1247,
  mostAffected: { district: 'Colombo', count: 183 },
  yearlyTrend: [
    { year: 2010, days: 58 },
    { year: 2011, days: 67 },
    { year: 2012, days: 72 },
    { year: 2013, days: 78 },
    { year: 2014, days: 85 },
    { year: 2015, days: 79 },
    { year: 2016, days: 94 },
    { year: 2017, days: 88 },
    { year: 2018, days: 96 },
    { year: 2019, days: 102 },
    { year: 2020, days: 89 },
    { year: 2021, days: 108 },
    { year: 2022, days: 115 },
    { year: 2023, days: 121 },
    { year: 2024, days: 125 }
  ],
  topDistricts: [
    { district: 'Colombo', days: 183 },
    { district: 'Gampaha', days: 165 },
    { district: 'Kandy', days: 142 },
    { district: 'Galle', days: 128 },
    { district: 'Matara', days: 115 },
    { district: 'Kalutara', days: 98 },
    { district: 'Kurunegala', days: 87 },
    { district: 'Ratnapura', days: 76 },
    { district: 'Batticaloa', days: 65 },
    { district: 'Trincomalee', days: 58 }
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

// Generate dynamic insight for Q4
const firstYear = q4Data.yearlyTrend[0];
const lastYear = q4Data.yearlyTrend[q4Data.yearlyTrend.length - 1];
const increase = lastYear.days - firstYear.days;
const increasePercent = ((increase / firstYear.days) * 100).toFixed(1);

const q4InsightText = `Extreme weather events have increased by ${increasePercent}% from ${firstYear.year} (${firstYear.days} days) to ${lastYear.year} (${lastYear.days} days). ${q4Data.mostAffected.district} is the most vulnerable district with ${q4Data.mostAffected.count} extreme weather days.`;

const q4InsightElement = document.querySelector('.card:nth-child(4) .insight');
if (q4InsightElement) {
  q4InsightElement.innerHTML = `<strong>⚠️ Trend Alert:</strong> ${q4InsightText}`;
}

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
