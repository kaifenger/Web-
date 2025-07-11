// API配置
const API_KEY = '8282a9833ca345febd4a337699e88b9f';
const API_HOST = 'https://pe6vhevkfp.re.qweatherapi.com';

// API函数
const weatherAPI = {
    // API配置的公开引用，便于其他函数访问
    API_KEY: API_KEY,
    API_HOST: API_HOST,
    
    // 通过搜索词获取城市数据 - 使用URL参数认证
    searchCity: async function(query) {
        try {
            console.log(`搜索城市: ${query}`);
            // 使用URL参数方式而不是请求头
            const url = `${API_HOST}/geo/v2/city/lookup?location=${encodeURIComponent(query)}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('城市搜索结果:', data);
            return data;
        } catch (error) {
            console.error('城市搜索错误:', error);
            return null;
        }
    },
    
    // 获取热门城市列表 - 使用URL参数认证
    getTopCities: async function(range = 'cn', number = 20) {
        try {
            console.log(`获取热门城市: range=${range}, number=${number}`);
            const url = `${API_HOST}/geo/v2/city/top?range=${range}&number=${number}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('热门城市结果:', data);
            return data;
        } catch (error) {
            console.error('获取热门城市错误:', error);
            return null;
        }
    },
    
    // 获取实时天气数据 - 使用URL参数认证
    getRealtimeWeather: async function(locationId) {
        try {
            console.log(`获取实时天气: locationId=${locationId}`);
            const url = `${API_HOST}/v7/weather/now?location=${locationId}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`城市 ${locationId} 的实时天气结果:`, data);
            return data;
        } catch (error) {
            console.error(`获取实时天气错误 (locationId=${locationId}):`, error);
            return null;
        }
    },
    
    // 获取多天天气预报 - 使用URL参数认证
    getDailyForecast: async function(locationId, days = '7d') {
        try {
            console.log(`获取${days}天气预报: locationId=${locationId}`);
            const url = `${API_HOST}/v7/weather/${days}?location=${locationId}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`城市 ${locationId} 的${days}天气预报结果:`, data);
            return data;
        } catch (error) {
            console.error(`获取每日预报错误 (locationId=${locationId}):`, error);
            return null;
        }
    },
    
    // 获取逐小时天气预报 - 使用URL参数认证
    getHourlyForecast: async function(locationId, hours = '24h') {
        try {
            console.log(`获取${hours}小时预报: locationId=${locationId}`);
            const url = `${API_HOST}/v7/weather/${hours}?location=${locationId}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`城市 ${locationId} 的${hours}小时预报结果:`, data);
            return data;
        } catch (error) {
            console.error(`获取小时预报错误 (locationId=${locationId}):`, error);
            return null;
        }
    },
    
    // 获取天气预警 - 使用URL参数认证
    getWeatherWarnings: async function(locationId) {
        try {
            console.log(`获取天气预警: locationId=${locationId}`);
            const url = `${API_HOST}/v7/warning/now?location=${locationId}&key=${API_KEY}`;
            console.log(`请求URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`城市 ${locationId} 的天气预警结果:`, data);
            return data;
        } catch (error) {
            console.error(`获取天气预警错误 (locationId=${locationId}):`, error);
            return null;
        }
    },
    
    // 同时获取多个城市的天气（用于排名）
    getBatchWeather: async function(locationIds) {
        try {
            console.log(`批量获取天气数据: locationIds=${locationIds.join(',')}`);
            const promises = locationIds.map(id => this.getRealtimeWeather(id));
            const results = await Promise.all(promises);
            console.log(`批量天气数据结果数量: ${results.length}`);
            return results;
        } catch (error) {
            console.error('获取批量天气数据错误:', error);
            return [];
        }
    },
    
    // 获取中国热门城市天气数据
    getTopCitiesWeather: async function() {
        try {
            console.log('开始获取热门城市天气数据');
            // 使用API获取热门城市列表
            const topCitiesData = await this.getTopCities('cn', 20);
            
            if (topCitiesData && topCitiesData.code === "200" && topCitiesData.topCityList && topCitiesData.topCityList.length > 0) {
                // 提取城市ID
                const cityIds = topCitiesData.topCityList.map(city => city.id);
                console.log('获取到热门城市ID列表:', cityIds);
                
                // 获取这些城市的天气数据
                const weatherDataPromises = cityIds.map(id => this.getRealtimeWeather(id));
                const weatherDataResults = await Promise.all(weatherDataPromises);
                
                // 将城市信息与天气数据关联
                const result = weatherDataResults.map((weatherData, index) => {
                    if (weatherData && weatherData.code === "200" && weatherData.now) {
                        const cityInfo = topCitiesData.topCityList[index];
                        return {
                            name: cityInfo.name,
                            id: cityInfo.id,
                            temp: parseInt(weatherData.now.temp),
                            adm1: cityInfo.adm1, // 省份
                            adm2: cityInfo.adm2  // 城市
                        };
                    }
                    return null;
                }).filter(item => item !== null);
                
                console.log(`成功关联的城市天气数据数量: ${result.length}`);
                return result;
            } else {
                console.error('获取热门城市列表失败:', topCitiesData);
                throw new Error('获取热门城市列表失败');
            }
        } catch (error) {
            console.error('获取热门城市天气数据错误:', error);
            throw error;
        }
    },
    
    // 测试城市搜索功能
    testCitySearch: async function(cityName) {
        console.log(`测试城市搜索: ${cityName}`);
        
        try {
            // 使用URL参数认证方式
            const url = `${API_HOST}/geo/v2/city/lookup?location=${encodeURIComponent(cityName)}&key=${API_KEY}`;
            console.log(`测试城市搜索URL: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('城市搜索测试结果:', data);
            return data;
        } catch (error) {
            console.error('城市搜索测试错误:', error);
            return null;
        }
    },
    
    // 直接测试API连接
    testAPIConnection: async function() {
        try {
            console.log('测试API连接...');
            // 使用北京的城市ID进行测试
            const testLocationId = '101010100';
            
            // 使用URL参数认证方式
            const url = `${API_HOST}/v7/weather/now?location=${testLocationId}&key=${API_KEY}`;
            console.log(`测试URL: ${url}`);
            
            const response = await fetch(url);
            
            console.log('API连接响应状态:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('测试API连接成功:', data);
                return {success: true, data: data};
            } else {
                console.error('API连接测试失败');
                return {success: false};
            }
        } catch (error) {
            console.error('测试API连接错误:', error);
            return {success: false, error: error};
        }
    }
};

// 页面加载时执行测试连接
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，测试API连接...');
    weatherAPI.testAPIConnection().then(result => {
        if (result.success) {
            console.log('API连接测试成功，可以开始使用天气API');
        } else {
            console.error('API连接测试失败，天气功能可能无法使用');
        }
    });
});

// 导出API
window.weatherAPI = weatherAPI;