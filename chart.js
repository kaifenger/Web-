// 温度到颜色的映射函数
function getTemperatureColor(temp) {
    // 温度范围从 -20°C 到 40°C
    // 颜色从蓝色（冷）到红色（热）
    if (temp <= -20) return 'rgb(0, 0, 255)';  // 深蓝色
    if (temp >= 40) return 'rgb(255, 0, 0)';   // 深红色
    
    // 低温区间 -20°C 到 0°C: 蓝色到浅蓝色
    if (temp < 0) {
        const ratio = (temp + 20) / 20;
        return `rgb(${Math.round(100 * ratio)}, ${Math.round(100 * ratio)}, 255)`;
    }
    // 中温区间 0°C 到 20°C: 浅蓝色到浅黄色
    else if (temp < 20) {
        const ratio = temp / 20;
        return `rgb(${Math.round(100 + 155 * ratio)}, ${Math.round(100 + 155 * ratio)}, ${Math.round(255 - 155 * ratio)})`;
    }
    // 高温区间 20°C 到 40°C: 浅黄色到深红色
    else {
        const ratio = (temp - 20) / 20;
        return `rgb(255, ${Math.round(255 - 255 * ratio)}, 0)`;
    }
}

// 创建温度随时间变化的线性图表
function createTemperatureChart(containerId, timeLabels, tempData, title) {
    const ctx = document.getElementById(containerId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: '温度 (°C)',
                data: tempData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '温度 (°C)'
                    }
                }
            }
        }
    });
}

// 创建湿度随时间变化的图表
function createHumidityChart(containerId, timeLabels, humidityData, title) {
    const ctx = document.getElementById(containerId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: '湿度 (%)',
                data: humidityData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '湿度 (%)'
                    }
                }
            }
        }
    });
}

// 创建温度对比图表（最高温度和最低温度）
function createTempComparisonChart(containerId, dateLabels, maxTemps, minTemps, title) {
    const ctx = document.getElementById(containerId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: dateLabels,
            datasets: [
                {
                    label: '最高温度',
                    data: maxTemps,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: false
                },
                {
                    label: '最低温度',
                    data: minTemps,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '温度 (°C)'
                    }
                }
            }
        }
    });
}