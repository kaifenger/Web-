document.addEventListener('DOMContentLoaded', function() {
    // 初始化地图
    const chartDom = document.getElementById('china-map');
    let myChart = null;
    
    if (chartDom) {
        myChart = echarts.init(chartDom);
        
        // 加载中国地图
        fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
            .then(response => response.json())
            .then(geoJson => {
                echarts.registerMap('China', geoJson);
                initMap();
                loadCitiesWeather();
            })
            .catch(error => {
                console.error('加载地图数据错误:', error);
                if (chartDom) {
                    chartDom.innerHTML = '<p style="text-align:center;padding:20px;">加载地图失败，请刷新页面重试。</p>';
                }
            });
    } else {
        console.log('找不到地图容器元素，可能不在地图页面');
    }

    // 初始化地图配置
    function initMap() {
        if (!myChart) return;
        
        const option = {
            title: {
                text: '中国实时温度地图',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const value = params.value;
                    if (value !== undefined) {
                        return `${params.name}<br/>温度：${value}°C`;
                    }
                    return `${params.name}`;
                }
            },
            visualMap: {
                min: -10,
                max: 40,
                calculable: true,
                inRange: {
                    color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                },
                text: ['高温', '低温'],
                left: 'left',
                orient: 'vertical'
            },
            series: [
                {
                    name: '实时温度',
                    type: 'map',
                    map: 'China',
                    emphasis: {
                        label: {
                            show: true
                        }
                    },
                    data: []
                }
            ]
        };

        myChart.setOption(option);

        // 点击事件
        myChart.on('click', function(params) {
            if (params.name) {
                searchCityAndRedirect(params.name);
            }
        });
    }

    // 加载城市温度数据
    async function loadCitiesWeather() {
        try {
            console.log('开始加载城市天气数据...');
            
            // 使用热门城市API获取中国所有热门城市
            // 注意：这将返回的是热门城市，而不是所有中国城市
            const topCitiesWeatherData = await weatherAPI.getTopCitiesWeather();
            console.log('热门城市天气数据:', topCitiesWeatherData);
            
            if (topCitiesWeatherData && topCitiesWeatherData.length > 0) {
                // 准备地图数据
                const mapData = topCitiesWeatherData.map(city => ({
                    name: city.name,
                    value: city.temp
                }));
                
                // 更新地图
                if (myChart) {
                    myChart.setOption({
                        series: [{
                            data: mapData
                        }]
                    });
                }
                
                // 生成温度排行榜
                generateTemperatureRankings(topCitiesWeatherData);
            } else {
                console.error('没有获取到有效的城市天气数据');
                document.getElementById('high-temp-table').getElementsByTagName('tbody')[0].innerHTML = 
                    '<tr><td colspan="3">获取天气数据失败，请刷新页面重试</td></tr>';
                document.getElementById('low-temp-table').getElementsByTagName('tbody')[0].innerHTML = 
                    '<tr><td colspan="3">获取天气数据失败，请刷新页面重试</td></tr>';
            }
        } catch (error) {
            console.error('加载城市天气数据错误:', error);
            document.getElementById('high-temp-table').getElementsByTagName('tbody')[0].innerHTML = 
                '<tr><td colspan="3">获取天气数据失败，请刷新页面重试</td></tr>';
            document.getElementById('low-temp-table').getElementsByTagName('tbody')[0].innerHTML = 
                '<tr><td colspan="3">获取天气数据失败，请刷新页面重试</td></tr>';
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

    // 搜索城市并跳转到详情页
    async function searchCityAndRedirect(cityName) {
        try {
            console.log(`搜索城市: ${cityName}`);
            const cityData = await weatherAPI.searchCity(cityName);
            console.log('搜索城市结果:', cityData);
            
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

    // 为搜索按钮添加事件
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchInput = document.getElementById('city-search').value.trim();
            if (searchInput) {
                searchCityAndRedirect(searchInput);
            }
        });
    }

    // 为搜索输入框添加回车事件
    const citySearch = document.getElementById('city-search');
    if (citySearch) {
        citySearch.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const searchInput = this.value.trim();
                if (searchInput) {
                    searchCityAndRedirect(searchInput);
                }
            }
        });
    }
});