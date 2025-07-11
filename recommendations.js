document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = urlParams.get('location') || localStorage.getItem('currentLocationId');
    const cityName = urlParams.get('name');
    
    if (!locationId) {
        window.location.href = 'index.html';
        return;
    }
    
    // 如果有城市名，直接设置
    if (cityName) {
        document.getElementById('city-name').textContent = decodeURIComponent(cityName);
    }
    
    // 尝试从本地存储获取天气数据
    const weatherDataString = localStorage.getItem('currentWeatherData');
    const forecastDataString = localStorage.getItem('forecastData');
    
    let weatherData = null;
    let forecastData = null;
    
    if (weatherDataString) {
        weatherData = JSON.parse(weatherDataString);
        displayCurrentWeather(weatherData);
    }
    
    if (forecastDataString) {
        forecastData = JSON.parse(forecastDataString);
    }
    
    // 如果本地没有天气数据，重新获取
    if (!weatherData) {
        loadCurrentWeather(locationId);
    }
    
    if (!forecastData) {
        loadDailyForecast(locationId);
    }
    
    // 生成天气建议
    generateWeatherRecommendations(weatherData, forecastData);
    
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
});

// 加载当前天气数据
async function loadCurrentWeather(locationId) {
    try {
        const weatherData = await weatherAPI.getRealtimeWeather(locationId);
        
        if (weatherData && weatherData.code === "200" && weatherData.now) {
            displayCurrentWeather(weatherData);
            
            // 获取7天预报
            const forecastData = await weatherAPI.getDailyForecast(locationId);
            
            // 生成天气建议
            generateWeatherRecommendations(weatherData, forecastData);
        } else {
            alert('获取天气数据失败，请刷新页面重试。');
        }
    } catch (error) {
        console.error('加载当前天气数据错误:', error);
    }
}

// 加载7天预报数据
async function loadDailyForecast(locationId) {
    try {
        const forecastData = await weatherAPI.getDailyForecast(locationId);
        const weatherDataString = localStorage.getItem('currentWeatherData');
        
        if (weatherDataString) {
            const weatherData = JSON.parse(weatherDataString);
            generateWeatherRecommendations(weatherData, forecastData);
        }
    } catch (error) {
        console.error('加载天气预报数据错误:', error);
    }
}

// 显示当前天气
function displayCurrentWeather(weatherData) {
    if (weatherData && weatherData.now) {
        const now = weatherData.now;
        
        // 更新页面标题
        if (document.getElementById('city-name').textContent === "城市名称") {
            document.getElementById('city-name').textContent = weatherData.fxLink.match(/weather\/([^-]+)/)[1];
        }
        
        // 更新页面内容
        document.getElementById('last-update').textContent = `更新时间: ${formatDateTime(weatherData.updateTime)}`;
        document.getElementById('current-temp').textContent = `${now.temp}°C`;
        document.getElementById('weather-text').textContent = now.text;
        document.getElementById('weather-icon').src = `https://a.hecdn.net/img/common/icon/202106d/${now.icon}.png`;
    }
}

// 生成天气建议
function generateWeatherRecommendations(weatherData, forecastData) {
    if (!weatherData || !weatherData.now) return;
    
    const now = weatherData.now;
    const temp = parseInt(now.temp);
    const text = now.text;
    const humidity = parseInt(now.humidity);
    
    // 穿衣建议
    let clothingRecommendation = '';
    if (temp <= 0) {
        clothingRecommendation = `
            <p>当前温度为 ${temp}°C，天气寒冷。</p>
            <p><strong>建议穿着：</strong>羽绒服、厚羊毛衫、冬季外套、厚围巾、帽子和手套。</p>
            <p><strong>提示：</strong>注意保暖，特别是头部、手部和脚部，避免冻伤。</p>
        `;
    } else if (temp <= 10) {
        clothingRecommendation = `
            <p>当前温度为 ${temp}°C，天气较冷。</p>
            <p><strong>建议穿着：</strong>厚外套、毛衣或针织衫、长裤、围巾和保暖帽。</p>
            <p><strong>提示：</strong>注意随身携带保暖衣物，防止温度骤降。</p>
        `;
    } else if (temp <= 20) {
        clothingRecommendation = `
            <p>当前温度为 ${temp}°C，天气舒适。</p>
            <p><strong>建议穿着：</strong>夹克衫、长袖衬衫、薄毛衣、休闲裤或牛仔裤。</p>
            <p><strong>提示：</strong>早晚温差可能较大，建议适当携带外套。</p>
        `;
    } else if (temp <= 28) {
        clothingRecommendation = `
            <p>当前温度为 ${temp}°C，天气温暖。</p>
            <p><strong>建议穿着：</strong>短袖T恤、轻便衬衫、休闲裤或短裤、凉鞋。</p>
            <p><strong>提示：</strong>出门记得涂防晒霜，携带遮阳帽或太阳伞。</p>
        `;
    } else {
        clothingRecommendation = `
            <p>当前温度为 ${temp}°C，天气炎热。</p>
            <p><strong>建议穿着：</strong>轻薄透气的棉质衣物、短裤、凉鞋。</p>
            <p><strong>提示：</strong>注意防暑降温，多喝水，避免长时间在阳光下暴晒。</p>
        `;
    }
    
    // 户外活动建议
    let activityRecommendation = '';
    if (text.includes('雨') || text.includes('雪') || text.includes('阴')) {
        activityRecommendation = `
            <p>当前天气：${text}，不太适合户外活动。</p>
            <p><strong>室内活动推荐：</strong></p>
            <ul>
                <li>参观博物馆或美术馆</li>
                <li>去电影院看场电影</li>
                <li>在咖啡馆阅读或工作</li>
                <li>逛商场购物</li>
                <li>在家做瑜伽或室内健身</li>
            </ul>
        `;
        
        if (text.includes('雨')) {
            activityRecommendation += `<p><strong>提示：</strong>外出请携带雨具，注意防滑。</p>`;
        } else if (text.includes('雪')) {
            activityRecommendation += `<p><strong>提示：</strong>外出请穿防滑鞋，注意保暖。</p>`;
        }
    } else if (text.includes('晴') || text.includes('多云')) {
        if (temp <= 10) {
            activityRecommendation = `
                <p>当前天气：${text}，温度较低，适合适当的户外活动。</p>
                <p><strong>推荐活动：</strong></p>
                <ul>
                    <li>步行或慢跑（注意保暖）</li>
                    <li>登山徒步</li>
                    <li>摄影采风</li>
                    <li>城市观光</li>
                </ul>
            `;
        } else if (temp <= 28) {
            activityRecommendation = `
                <p>当前天气：${text}，温度适宜，非常适合户外活动。</p>
                <p><strong>推荐活动：</strong></p>
                <ul>
                    <li>野餐</li>
                    <li>远足徒步</li>
                    <li>骑行</li>
                    <li>钓鱼</li>
                    <li>户外运动（如篮球、足球、羽毛球等）</li>
                    <li>公园散步</li>
                </ul>
            `;
        } else {
            activityRecommendation = `
                <p>当前天气：${text}，温度较高，建议避开中午高温时段进行户外活动。</p>
                <p><strong>推荐活动：</strong></p>
                <ul>
                    <li>清晨或傍晚散步</li>
                    <li>游泳</li>
                    <li>水上运动</li>
                    <li>在有遮阴的地方休闲</li>
                </ul>
                <p><strong>提示：</strong>户外活动请做好防晒措施，多补充水分。</p>
            `;
        }
    } else {
        activityRecommendation = `
            <p>当前天气：${text}，请根据实际情况选择合适的活动。</p>
            <p><strong>建议：</strong>关注天气变化，随时调整活动计划。</p>
        `;
    }
    
    // 健康提示
    let healthRecommendation = '';
    if (temp <= 0) {
        healthRecommendation = `
            <p>寒冷天气健康提示：</p>
            <ul>
                <li>注意保暖，预防感冒和心脑血管疾病</li>
                <li>室内注意保持适当通风</li>
                <li>多吃高蛋白和维生素丰富的食物</li>
                <li>保持适度运动，增强抵抗力</li>
                <li>外出前可用润肤霜保护皮肤</li>
            </ul>
        `;
    } else if (temp >= 30) {
        healthRecommendation = `
            <p>高温天气健康提示：</p>
            <ul>
                <li>多饮水，补充电解质，避免中暑</li>
                <li>避免长时间在阳光下暴晒</li>
                <li>适当食用清凉食物，如西瓜、绿豆汤等</li>
                <li>避免剧烈运动，尤其是在中午高温时段</li>
                <li>注意空调温度不要过低，防止感冒</li>
            </ul>
        `;
    } else if (humidity >= 80) {
        healthRecommendation = `
            <p>湿度较高天气健康提示：</p>
            <ul>
                <li>注意防潮，保持室内干燥</li>
                <li>避免在潮湿环境中长时间停留</li>
                <li>注意个人卫生，防止皮肤真菌感染</li>
                <li>关节炎患者应注意保暖</li>
                <li>呼吸系统疾病患者应避免在高湿环境中剧烈运动</li>
            </ul>
        `;
    } else if (text.includes('雾') || text.includes('霾')) {
        healthRecommendation = `
            <p>雾霾天气健康提示：</p>
            <ul>
                <li>外出佩戴口罩，减少污染物吸入</li>
                <li>减少户外活动时间</li>
                <li>回家后及时洗手、洗脸、漱口</li>
                <li>室内使用空气净化器</li>
                <li>多饮水，多吃新鲜蔬果</li>
            </ul>
        `;
    } else {
        healthRecommendation = `
            <p>一般健康提示：</p>
            <ul>
                <li>保持充足睡眠和均衡饮食</li>
                <li>适当锻炼，增强身体素质</li>
                <li>保持心情愉快，避免过度疲劳</li>
                <li>多饮水，保持身体水分</li>
                <li>保持良好的个人卫生习惯</li>
            </ul>
        `;
    }
    
    // 天气相关新闻（模拟数据）
    let weatherNews = '';
    if (text.includes('雨')) {
        weatherNews = `
            <div class="news-item">
                <div class="news-title">暴雨来袭，多地发布预警信号</div>
                <div class="news-content">近日，华北、华东地区将迎来强降雨过程，多地气象部门发布暴雨预警信号，提醒市民注意防范。</div>
                <div class="news-source">来源：中国天气网 | 2025-07-11</div>
            </div>
            <div class="news-item">
                <div class="news-title">如何在雨季保持健康？专家支招</div>
                <div class="news-content">雨季来临，潮湿环境易滋生细菌，专家建议注意保持室内通风干燥，避免食用隔夜食物。</div>
                <div class="news-source">来源：健康时报 | 2025-07-10</div>
            </div>
        `;
    } else if (temp >= 30) {
        weatherNews = `
            <div class="news-item">
                <div class="news-title">高温持续，全国多地电力供应紧张</div>
                <div class="news-content">受持续高温天气影响，全国多地用电负荷屡创新高，部分地区采取错峰用电措施。</div>
                <div class="news-source">来源：能源报道 | 2025-07-11</div>
            </div>
            <div class="news-item">
                <div class="news-title">夏季防暑降温指南发布</div>
                <div class="news-content">卫生部门发布夏季防暑降温指南，提醒公众高温天气注意补充水分，避免长时间户外活动。</div>
                <div class="news-source">来源：生活报 | 2025-07-09</div>
            </div>
        `;
    } else if (text.includes('雪')) {
        weatherNews = `
            <div class="news-item">
                <div class="news-title">北方多地迎来降雪，交通受阻</div>
                <div class="news-content">近日，北方多地迎来大范围降雪天气，部分高速公路临时封闭，铁路、航空运输也受到影响。</div>
                <div class="news-source">来源：交通新闻 | 2025-07-11</div>
            </div>
            <div class="news-item">
                <div class="news-title">冬季取暖安全指南发布</div>
                <div class="news-content">随着寒潮来袭，消防部门发布冬季取暖安全指南，提醒市民注意用火、用电安全，预防一氧化碳中毒。</div>
                <div class="news-source">来源：安全生活 | 2025-07-08</div>
            </div>
        `;
    } else {
        weatherNews = `
            <div class="news-item">
                <div class="news-title">全球气候变化加剧，极端天气事件增多</div>
                <div class="news-content">最新气候研究报告显示，全球气候变化导致极端天气事件频率增加，包括热浪、暴雨等。</div>
                <div class="news-source">来源：环球科学 | 2025-07-11</div>
            </div>
            <div class="news-item">
                <div class="news-title">气象部门推出新版天气预报APP</div>
                <div class="news-content">国家气象局推出新版天气预报应用，提供更精准的分钟级降水预报和空气质量信息。</div>
                <div class="news-source">来源：科技日报 | 2025-07-07</div>
            </div>
        `;
    }
    
    // 更新页面内容
    document.getElementById('clothing-recommendation').innerHTML = clothingRecommendation;
    document.getElementById('activity-recommendation').innerHTML = activityRecommendation;
    document.getElementById('health-recommendation').innerHTML = healthRecommendation;
    document.getElementById('weather-news').innerHTML = weatherNews;
}

// 搜索城市并跳转到详情页
async function searchCityAndRedirect(cityName) {
    try {
        const cityData = await weatherAPI.searchCity(cityName);
        if (cityData && cityData.code === "200" && cityData.location && cityData.location.length > 0) {
            const locationId = cityData.location[0].id;
            window.location.href = `detail.html?location=${locationId}&name=${encodeURIComponent(cityData.location[0].name)}`;
        } else {
            alert(`未找到城市: ${cityName}`);
        }
    } catch (error) {
        console.error('搜索城市错误:', error);
        alert('搜索城市时出错，请稍后重试。');
    }
}

// 格式化日期时间：2021-02-16T16:00+08:00 -> 02-16 16:00
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}