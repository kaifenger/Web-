document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get('location');
    const cityName = urlParams.get('name');
    
    if (!locationId) {
        window.location.href = 'index.html';
        return;
    }
    
    // 如果有城市名，直接设置
    if (cityName) {
        document.getElementById('city-name').textContent = decodeURIComponent(cityName);
    }
    
    // 存储当前城市ID和天气数据到本地存储（用于建议页面）
    localStorage.setItem('currentLocationId', locationId);
    
    // 加载当前天气数据
    loadCurrentWeather(locationId);
    
    // 加载7天预报数据
    loadDailyForecast(locationId);
    
    // 加载24小时预报数据
    loadHourlyForecast(locationId);
    
    // 加载天气预警
    loadWeatherWarnings(locationId);
    
    // 为搜索按钮添加事件
    document.getElementById('search-button').addEventListener('click', function() {
        const searchInput = document.getElementById('city-search').value.trim();
        if (searchInput) {
            searchCityAndRedirect(searchInput);
        }
    });
    
    // 为搜索输入框添加回车事件
    document.getElementById('city-search').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const searchInput = document.getElementById('city-search').value.trim();
            if (searchInput) {
                searchCityAndRedirect(searchInput);
            }
        }
    });
    
    // 设置建议按钮链接
    if (document.getElementById('recommendations-btn')) {
        document.getElementById('recommendations-btn').href = `recommendations.html?location=${locationId}&name=${cityName}`;
    }
});

// 加载当前天气数据
async function loadCurrentWeather(locationId) {
    try {
        const weatherData = await weatherAPI.getRealtimeWeather(locationId);
        
        if (weatherData && weatherData.code === "200" && weatherData.now) {
            const now = weatherData.now;
            
            // 更新页面标题
            if (document.getElementById('city-name').textContent === "城市名称") {
                let cityName = "未知城市";
                if (weatherData.fxLink) {
                    const match = weatherData.fxLink.match(/weather\/([^-]+)/);
                    if (match && match[1]) {
                        cityName = match[1];
                    }
                }
                document.getElementById('city-name').textContent = cityName;
            }
            
            // 更新页面内容
            document.getElementById('last-update').textContent = `更新时间: ${formatDateTime(weatherData.updateTime)}`;
            document.getElementById('current-temp').textContent = `${now.temp}°C`;
            document.getElementById('weather-text').textContent = now.text;
            
            // 更新天气图标
            const weatherIconElement = document.getElementById('weather-icon');
            if (weatherIconElement) {
                weatherIconElement.src = `https://a.hecdn.net/img/common/icon/202106d/${now.icon}.png`;
                weatherIconElement.alt = now.text;
            }
            
            // 更新详细信息
            updateElementIfExists('feels-like', `${now.feelsLike}°C`);
            updateElementIfExists('humidity', `${now.humidity}%`);
            updateElementIfExists('wind', `${now.windDir} ${now.windScale}级 ${now.windSpeed}km/h`);
            updateElementIfExists('pressure', `${now.pressure}hPa`);
            updateElementIfExists('visibility', `${now.vis}km`);
            updateElementIfExists('precipitation', `${now.precip}mm`);
            
            // 保存当前天气数据到本地存储（用于建议页面）
            localStorage.setItem('currentWeatherData', JSON.stringify(weatherData));
        } else {
            console.error('获取天气数据失败:', weatherData);
            alert('获取天气数据失败，请刷新页面重试。');
        }
    } catch (error) {
        console.error('加载当前天气数据错误:', error);
    }
}

// 更新元素内容（如果元素存在）
function updateElementIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// 加载7天预报数据
async function loadDailyForecast(locationId) {
    try {
        const forecastData = await weatherAPI.getDailyForecast(locationId);
        
        if (forecastData && forecastData.code === "200" && forecastData.daily) {
            const daily = forecastData.daily;
            const forecastContainer = document.getElementById('daily-forecast');
            
            if (forecastContainer) {
                forecastContainer.innerHTML = '';
                
                daily.forEach(day => {
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    forecastItem.innerHTML = `
                        <div class="forecast-date">${formatDate(day.fxDate)}</div>
                        <div class="forecast-icon">
                            <img src="https://a.hecdn.net/img/common/icon/202106d/${day.iconDay}.png" alt="${day.textDay}">
                        </div>
                        <div class="forecast-text">${day.textDay}</div>
                        <div class="forecast-temp">
                            <span class="max-temp">${day.tempMax}°</span>
                            <span class="min-temp">${day.tempMin}°</span>
                        </div>
                        <div class="forecast-wind">${day.windDirDay} ${day.windScaleDay}级</div>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
                
                // 创建温度趋势图
                createTemperatureChart(daily);
            }
            
            // 保存天气预报数据到本地存储（用于建议页面）
            localStorage.setItem('forecastData', JSON.stringify(forecastData));
        } else {
            console.error('获取天气预报数据失败:', forecastData);
        }
    } catch (error) {
        console.error('加载天气预报数据错误:', error);
    }
}

// 加载24小时预报数据
async function loadHourlyForecast(locationId) {
    try {
        const hourlyData = await weatherAPI.getHourlyForecast(locationId);
        
        if (hourlyData && hourlyData.code === "200" && hourlyData.hourly) {
            const hourly = hourlyData.hourly;
            const hourlyContainer = document.getElementById('hourly-forecast');
            
            if (hourlyContainer) {
                hourlyContainer.innerHTML = '';
                
                hourly.forEach(hour => {
                    const hourlyItem = document.createElement('div');
                    hourlyItem.className = 'hourly-item';
                    hourlyItem.innerHTML = `
                        <div class="hourly-time">${formatTime(hour.fxTime)}</div>
                        <div class="hourly-icon">
                            <img src="https://a.hecdn.net/img/common/icon/202106d/${hour.icon}.png" alt="${hour.text}">
                        </div>
                        <div class="hourly-temp">${hour.temp}°C</div>
                        <div class="hourly-text">${hour.text}</div>
                    `;
                    hourlyContainer.appendChild(hourlyItem);
                });
            }
        } else {
            console.error('获取小时预报数据失败:', hourlyData);
        }
    } catch (error) {
        console.error('加载小时预报数据错误:', error);
    }
}

// 加载天气预警
async function loadWeatherWarnings(locationId) {
    try {
        const warningsData = await weatherAPI.getWeatherWarnings(locationId);
        
        if (warningsData && warningsData.code === "200") {
            const warningsContainer = document.getElementById('weather-warnings');
            
            if (warningsContainer) {
                if (warningsData.warning && warningsData.warning.length > 0) {
                    warningsContainer.innerHTML = '';
                    
                    warningsData.warning.forEach(warning => {
                        const warningItem = document.createElement('div');
                        warningItem.className = 'warning-item';
                        warningItem.innerHTML = `
                            <div class="warning-title">${warning.title}</div>
                            <div class="warning-content">${warning.text}</div>
                            <div class="warning-time">发布时间: ${formatDateTime(warning.pubTime)}</div>
                            <div class="warning-source">发布单位: ${warning.sender}</div>
                        `;
                        warningsContainer.appendChild(warningItem);
                    });
                } else {
                    warningsContainer.innerHTML = '<p>当前没有天气预警信息</p>';
                }
            }
        } else {
            console.error('获取天气预警数据失败:', warningsData);
        }
    } catch (error) {
        console.error('加载天气预警数据错误:', error);
    }
}

// 创建温度趋势图
function createTemperatureChart(dailyData) {
    const chartContainer = document.getElementById('temp-chart');
    
    if (chartContainer && window.Chart) {
        const dates = dailyData.map(day => formatDate(day.fxDate));
        const maxTemps = dailyData.map(day => parseInt(day.tempMax));
        const minTemps = dailyData.map(day => parseInt(day.tempMin));
        
        const ctx = chartContainer.getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '最高温度',
                        data: maxTemps,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: false,
                        tension: 0.2
                    },
                    {
                        label: '最低温度',
                        data: minTemps,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        fill: false,
                        tension: 0.2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '温度趋势'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            }
                        }
                    }
                }
            }
        });
    } else {
        console.error('无法创建温度趋势图: Chart容器或Chart.js库不可用');
    }
}

// 搜索城市并跳转到详情页
async function searchCityAndRedirect(cityName) {
    try {
        const cityData = await weatherAPI.searchCity(cityName);
        if (cityData && cityData.code === "200" && cityData.location && cityData.location.length > 0) {
            const locationId = cityData.location[0].id;
            window.location.href = `detail.html?location=${locationId}&name=${encodeURIComponent(cityData.location[0].name)}`;
        } else {
            console.error('未找到城市数据:', cityData);
            alert(`未找到城市: ${cityName}`);
        }
    } catch (error) {
        console.error('搜索城市错误:', error);
        alert('搜索城市时出错，请稍后重试。');
    }
}

// 格式化日期：2021-02-16 -> 02月16日
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

// 格式化时间：2021-02-16T16:00+08:00 -> 16:00
function formatTime(timeString) {
    return timeString.substr(11, 5);
}

// 格式化日期时间：2021-02-16T16:00+08:00 -> 02-16 16:00
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}