document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面功能
    initPage();
    
    // 添加搜索功能
    document.getElementById('search-button').addEventListener('click', function() {
        const searchInput = document.getElementById('city-search').value.trim();
        if (searchInput) {
            searchCity(searchInput);
        }
    });
    
    document.getElementById('city-search').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const searchInput = this.value.trim();
            if (searchInput) {
                searchCity(searchInput);
            }
        }
    });
    
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
        
        console.log('页面初始化完成');
    }
    
    // 搜索城市函数
    async function searchCity(query) {
        try {
            console.log(`主页搜索城市: ${query}`);
            const result = await weatherAPI.searchCity(query);
            console.log('搜索结果:', result);
            
            if (result && result.code === "200" && result.location && result.location.length > 0) {
                // 找到城市，跳转到详情页
                const location = result.location[0];
                
                // 保存到最近访问的城市
                saveRecentCity(location.id, location.name);
                
                window.location.href = `detail.html?location=${location.id}&name=${encodeURIComponent(location.name)}`;
            } else {
                // 未找到城市
                alert(`未找到城市: ${query}`);
            }
        } catch (error) {
            console.error('搜索城市出错:', error);
            alert('搜索出错，请稍后重试');
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
        
        // 给搜索框添加焦点效果
        const searchInput = document.getElementById('city-search');
        if (searchInput && searchInput.parentNode) {
            searchInput.addEventListener('focus', function() {
                this.parentNode.classList.add('focus');
            });
            searchInput.addEventListener('blur', function() {
                this.parentNode.classList.remove('focus');
            });
        }
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
});