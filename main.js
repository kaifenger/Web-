document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initPage();
    
    // 注意：搜索功能现在由 integrated-map.js 处理
    
    // 初始化页面函数
    function initPage() {
        // 显示加载中提示
        const highTempTable = document.getElementById('high-temp-table');
        const lowTempTable = document.getElementById('low-temp-table');
        
        if (highTempTable) {
            highTempTable.getElementsByTagName('tbody')[0].innerHTML = 
                '<tr><td colspan="3">加载中...</td></tr>';
        }
        
        if (lowTempTable) {
            lowTempTable.getElementsByTagName('tbody')[0].innerHTML = 
                '<tr><td colspan="3">加载中...</td></tr>';
        }
            
        // 检查浏览器本地存储中是否有最近访问的城市
        checkRecentCities();
        
        // 添加页面交互效果
        addUIEffects();
        
        // 检查当前时间更新页面主题
        updateTimeBasedTheme();

        // 加载热门城市天气数据用于排行榜
        loadRankingData();
        
        console.log('页面初始化完成');
    }

    // 加载排行榜数据
    async function loadRankingData() {
        try {
            console.log('开始加载城市天气数据...');
            
            const topCitiesWeatherData = await weatherAPI.getTopCitiesWeather();
            console.log('热门城市天气数据:', topCitiesWeatherData);
            
            if (topCitiesWeatherData && topCitiesWeatherData.length > 0) {
                // 生成温度排行榜
                generateTemperatureRankings(topCitiesWeatherData);
            } else {
                console.error('没有获取到有效的城市天气数据');
                showRankingError();
            }
        } catch (error) {
            console.error('加载城市天气数据错误:', error);
            showRankingError();
        }
    }

    // 生成温度排行榜
    function generateTemperatureRankings(weatherData) {
        // 按温度排序
        const highTempData = [...weatherData].sort((a, b) => b.temp - a.temp);
        const lowTempData = [...weatherData].sort((a, b) => a.temp - b.temp);
        
        // 高温排行榜
        const highTempTable = document.getElementById('high-temp-table');
        if (highTempTable) {
            const tbody = highTempTable.getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
            
            highTempData.slice(0, 10).forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.temp}°C</td>
                `;
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    window.location.href = `detail.html?location=${item.id}&name=${encodeURIComponent(item.name)}`;
                });
                tbody.appendChild(row);
            });
        }
        
        // 低温排行榜
        const lowTempTable = document.getElementById('low-temp-table');
        if (lowTempTable) {
            const tbody = lowTempTable.getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
            
            lowTempData.slice(0, 10).forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.temp}°C</td>
                `;
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    window.location.href = `detail.html?location=${item.id}&name=${encodeURIComponent(item.name)}`;
                });
                tbody.appendChild(row);
            });
        }
    }

    // 显示排行榜错误
    function showRankingError() {
        const errorMessage = '<tr><td colspan="3">获取天气数据失败，请刷新页面重试</td></tr>';
        
        const highTempTable = document.getElementById('high-temp-table');
        if (highTempTable) {
            highTempTable.getElementsByTagName('tbody')[0].innerHTML = errorMessage;
        }
        
        const lowTempTable = document.getElementById('low-temp-table');
        if (lowTempTable) {
            lowTempTable.getElementsByTagName('tbody')[0].innerHTML = errorMessage;
        }
    }
    
    // 检查并显示最近访问的城市
    function checkRecentCities() {
        const recentCities = JSON.parse(localStorage.getItem('recentCities') || '[]');
        
        if (recentCities.length > 0) {
            const recentCitiesContainer = document.createElement('div');
            recentCitiesContainer.className = 'recent-cities';
            recentCitiesContainer.innerHTML = '<h3>最近访问</h3>';
            
            const citiesList = document.createElement('div');
            citiesList.className = 'cities-list';
            
            recentCities.slice(0, 5).forEach(city => {
                const cityLink = document.createElement('a');
                cityLink.href = `detail.html?location=${city.id}&name=${encodeURIComponent(city.name)}`;
                cityLink.className = 'city-link';
                cityLink.textContent = city.name;
                citiesList.appendChild(cityLink);
            });
            
            recentCitiesContainer.appendChild(citiesList);
            
            // 插入到地图下方，排行榜上方
            const mapSection = document.querySelector('.map-section');
            if (mapSection) {
                mapSection.parentNode.insertBefore(recentCitiesContainer, mapSection.nextSibling);
            }
        }
    }
    
    // 保存最近访问的城市
    function saveRecentCity(id, name) {
        let recentCities = JSON.parse(localStorage.getItem('recentCities') || '[]');
        
        // 检查是否已存在，如果存在则删除旧的记录
        recentCities = recentCities.filter(city => city.id !== id);
        
        // 添加到最前面
        recentCities.unshift({
            id: id,
            name: name
        });
        
        // 最多保存10个
        if (recentCities.length > 10) {
            recentCities.pop();
        }
        
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
    }
    
    // 添加UI交互效果
    function addUIEffects() {
        // 给表格行添加悬停效果
        const tableRows = document.querySelectorAll('table tbody tr');
        tableRows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.classList.add('hover');
            });
            row.addEventListener('mouseleave', function() {
                this.classList.remove('hover');
            });
        });
    }
    
    // 根据当前时间更新主题
    function updateTimeBasedTheme() {
        const now = new Date();
        const hour = now.getHours();
        const body = document.body;
        
        // 清除可能存在的主题类
        body.classList.remove('theme-morning', 'theme-day', 'theme-evening', 'theme-night');
        
        // 根据时间段设置不同的主题
        if (hour >= 5 && hour < 10) {
            body.classList.add('theme-morning');
        } else if (hour >= 10 && hour < 17) {
            body.classList.add('theme-day');
        } else if (hour >= 17 && hour < 21) {
            body.classList.add('theme-evening');
        } else {
            body.classList.add('theme-night');
        }
    }

    // 导出函数供其他脚本使用
    window.saveRecentCity = saveRecentCity;
});