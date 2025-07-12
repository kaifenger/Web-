// 集成地图和天气功能
document.addEventListener('DOMContentLoaded', function() {
    let map = null;
    let windowsArr = [];
    let marker = [];

    // 初始化地图
    function initMap() {
        if (document.getElementById('mapContainer')) {
            try {
                if (typeof AMap !== 'undefined') {
                    map = new AMap.Map('mapContainer', {
                        resizeEnable: true,
                        center: new AMap.LngLat(116.397428, 39.90923), // 设置中心点为北京
                        zoom: 5 // 设置缩放级别
                    });

                    // 添加地图控件
                    map.plugin(['AMap.ToolBar','AMap.MapType','AMap.Scale'],function(){
                        // 地图工具栏
                        var toolBar = new AMap.ToolBar();
                        map.addControl(toolBar);

                        // 地图类型切换
                        var mapType = new AMap.MapType({
                            defaultType:0,
                            showRoad:true
                        });
                        map.addControl(mapType);

                        // 比例尺
                        var scale = new AMap.Scale();
                        map.addControl(scale);
                    });

                    // 添加3D楼块
                    addBuildings();
                    
                    console.log('AMap地图初始化成功');
                } else {
                    showMapFallback();
                }
            } catch (error) {
                console.error('地图初始化错误:', error);
                showMapFallback();
            }
        }
    }

    // 地图备用显示（当AMap不可用时）
    function showMapFallback() {
        var mapContainer = document.getElementById('mapContainer');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 2rem;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
                    <h3 style="margin-bottom: 1rem;">地图功能演示</h3>
                    <p style="margin-bottom: 1rem; line-height: 1.6;">
                        地图服务暂时不可用，但搜索功能仍然可以使用。<br/>
                        在实际环境中，这里会显示完整的互动地图。
                    </p>
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        请使用上方搜索框测试搜索功能
                    </p>
                </div>
            `;
        }
    }

    // 添加3D楼块图层
    function addBuildings() {
        if (document.createElement('canvas').getContext('2d')) {
            var buildings = new AMap.Buildings();
            buildings.setMap(map);
        }
    }

    // 搜索建议功能
    function autoSearch() {
        var keywords = document.getElementById("keyword").value;
        
        if (keywords.length > 0) {
            // 尝试使用AMap搜索
            if (typeof AMap !== 'undefined') {
                AMap.service(["AMap.Autocomplete"], function() {
                    var autoOptions = {
                        city: ""
                    };
                    var auto = new AMap.Autocomplete(autoOptions);
                    auto.search(keywords, function(status, result){
                        autocomplete_CallBack(result);
                    });
                });
            } else {
                // 如果AMap不可用，提供一个简单的城市列表作为fallback
                showFallbackSearch(keywords);
            }
        } else {
            document.getElementById("result1").style.display = "none";
        }
    }

    // 备用搜索功能（当AMap不可用时）
    function showFallbackSearch(keywords) {
        var cities = [
            {name: '北京', district: '北京市', adcode: '110100'},
            {name: '上海', district: '上海市', adcode: '310100'},
            {name: '广州', district: '广东省', adcode: '440100'},
            {name: '深圳', district: '广东省', adcode: '440300'},
            {name: '杭州', district: '浙江省', adcode: '330100'},
            {name: '南京', district: '江苏省', adcode: '320100'},
            {name: '武汉', district: '湖北省', adcode: '420100'},
            {name: '成都', district: '四川省', adcode: '510100'},
            {name: '西安', district: '陕西省', adcode: '610100'},
            {name: '重庆', district: '重庆市', adcode: '500100'}
        ];
        
        var filteredCities = cities.filter(city => 
            city.name.toLowerCase().includes(keywords.toLowerCase())
        );
        
        var fakeResult = {
            tips: filteredCities.length > 0 ? filteredCities : [{
                name: keywords + ' (演示)',
                district: '演示数据',
                adcode: '000000'
            }]
        };
        
        autocomplete_CallBack(fakeResult);
    }

    // 输出搜索建议结果
    function autocomplete_CallBack(data) {
        var resultStr = "";
        var tipArr = data.tips;
        
        if (tipArr && tipArr.length > 0) {
            for (var i = 0; i < tipArr.length; i++) {
                resultStr += "<div id='divid" + (i + 1) + "' onmouseover='openMarkerTipById(" + (i + 1)
                            + ",this)' onclick='selectResult(" + i + ")' onmouseout='onmouseout_MarkerStyle(" + (i + 1)
                            + ",this)' style=\"font-size: 13px;cursor:pointer;padding:5px 5px 5px 5px;\"" + "data=" + tipArr[i].adcode + ">" + tipArr[i].name + "<span style='color:#C1C1C1;'>"+ tipArr[i].district + "</span></div>";
            }
        } else {
            resultStr = "<div style='padding: 20px; text-align: center; color: #666;'>" +
                       "<div style='font-size: 24px; margin-bottom: 10px;'>🤔</div>" +
                       "<div style='font-size: 14px; line-height: 1.6;'>" +
                       "抱歉，没有找到相关结果<br/>" +
                       "建议您：<br/>" +
                       "• 检查关键词拼写<br/>" +
                       "• 尝试使用更常见的地名<br/>" +
                       "• 尝试缩短搜索词</div></div>";
        }
        
        document.getElementById("result1").curSelect = -1;
        document.getElementById("result1").tipArr = tipArr;
        document.getElementById("result1").innerHTML = resultStr;
        document.getElementById("result1").style.display = "block";
    }

    // 选择搜索结果
    function selectResult(index) {
        if(index < 0) return;
        
        var text = document.getElementById("divid" + (index + 1)).innerHTML.replace(/<[^>].*?>.*<\/[^>].*?>/g,"");
        var cityCode = document.getElementById("divid" + (index + 1)).getAttribute('data');
        
        document.getElementById("keyword").value = text;
        document.getElementById("result1").style.display = "none";
        
        // 处理地图搜索（如果AMap可用）
        if (typeof AMap !== 'undefined' && map) {
            // 搜索地点并显示在地图上
            map.plugin(["AMap.PlaceSearch"], function() {
                var msearch = new AMap.PlaceSearch();
                AMap.event.addListener(msearch, "complete", function(result) {
                    placeSearch_CallBack(result, text);
                });
                msearch.setCity(cityCode);
                msearch.search(text);
            });
        } else {
            // 如果AMap不可用，显示搜索结果区域
            showSearchResults(text);
        }

        // 同时搜索天气信息
        searchWeatherInfo(text);
    }

    // 地点搜索结果回调
    function placeSearch_CallBack(data, locationName) {
        // 清空地图上的标记
        windowsArr = [];
        marker = [];
        map.clearMap();
        
        var poiArr = data.poiList.pois;
        var resultCount = poiArr.length;
        
        for (var i = 0; i < resultCount; i++) {
            addmarker(i, poiArr[i]);
        }
        
        if (resultCount > 0) {
            map.setFitView();
            // 显示搜索结果区域
            showSearchResults(locationName);
        }
    }

    // 添加地图标记
    function addmarker(i, d) {
        var lngX = d.location.getLng();
        var latY = d.location.getLat();
        
        var markerOption = {
            map: map,
            icon: "http://webapi.amap.com/images/" + (i + 1) + ".png",
            position: new AMap.LngLat(lngX, latY)
        };
        
        var mar = new AMap.Marker(markerOption);
        marker.push(new AMap.LngLat(lngX, latY));

        var infoWindow = new AMap.InfoWindow({
            content: "<h3><font color=\"#00a6ac\">  " + (i + 1) + ". " + d.name + "</font></h3>" + TipContents(d.type, d.address, d.tel),
            size: new AMap.Size(300, 0),
            autoMove: true,
            offset: new AMap.Pixel(0,-30)
        });
        
        windowsArr.push(infoWindow);
        
        AMap.event.addListener(mar, "mouseover", function() {
            infoWindow.open(map, mar.getPosition());
        });
    }

    // 信息窗口内容
    function TipContents(type, address, tel) {
        var str = "  地址：" + (address || "暂无") + "<br />  电话：" + (tel || "暂无") + " <br />  类型：" + (type || "暂无");
        return str;
    }

    // 搜索天气信息
    async function searchWeatherInfo(locationName) {
        try {
            console.log(`搜索天气信息: ${locationName}`);
            
            // 检查weatherAPI是否可用
            if (typeof weatherAPI === 'undefined') {
                showWeatherDemo(locationName);
                return;
            }
            
            const result = await weatherAPI.searchCity(locationName);
            
            if (result && result.code === "200" && result.location && result.location.length > 0) {
                const location = result.location[0];
                await loadWeatherData(location.id, location.name);
            } else {
                showWeatherDemo(locationName);
            }
        } catch (error) {
            console.error('搜索天气信息错误:', error);
            showWeatherDemo(locationName);
        }
    }

    // 天气演示数据（当API不可用时）
    function showWeatherDemo(locationName) {
        const searchResults = document.getElementById('search-results');
        const selectedLocation = document.getElementById('selected-location');
        const weatherInfo = document.getElementById('weather-info');
        
        selectedLocation.textContent = `${locationName} - 天气信息 (演示数据)`;
        
        // 生成一些模拟天气数据
        const mockTemp = Math.floor(Math.random() * 30) + 5;
        const mockHumidity = Math.floor(Math.random() * 40) + 40;
        const weatherTypes = ['晴', '多云', '阴', '小雨', '雾'];
        const mockWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        
        weatherInfo.innerHTML = `
            <div class="weather-summary">
                <div class="current-weather">
                    <h4>当前天气 (演示数据)</h4>
                    <p><strong>温度:</strong> ${mockTemp}°C</p>
                    <p><strong>体感温度:</strong> ${mockTemp + Math.floor(Math.random() * 6) - 3}°C</p>
                    <p><strong>天气:</strong> ${mockWeather}</p>
                    <p><strong>湿度:</strong> ${mockHumidity}%</p>
                    <p><strong>风向:</strong> 东南风 ${Math.floor(Math.random() * 15) + 5}km/h</p>
                    <p><strong>气压:</strong> ${Math.floor(Math.random() * 50) + 1000}hPa</p>
                    <p><strong>能见度:</strong> ${Math.floor(Math.random() * 20) + 10}km</p>
                </div>
                <div class="weather-actions">
                    <p style="text-align: center; margin-bottom: 1rem; font-size: 0.9rem; color: #666;">
                        这是演示数据。<br/>
                        在实际环境中会显示真实天气信息。
                    </p>
                    <a href="detail.html?location=demo&name=${encodeURIComponent(locationName)}" class="btn">查看详细天气 (演示)</a>
                </div>
            </div>
        `;
        
        searchResults.style.display = 'block';
        
        // 滚动到搜索结果
        searchResults.scrollIntoView({ behavior: 'smooth' });
    }

    // 加载天气数据
    async function loadWeatherData(locationId, locationName) {
        try {
            const weatherData = await weatherAPI.getRealtimeWeather(locationId);
            
            if (weatherData && weatherData.code === "200" && weatherData.now) {
                displayWeatherInfo(locationName, weatherData.now, locationId);
            } else {
                showWeatherError("获取天气数据失败");
            }
        } catch (error) {
            console.error('加载天气数据错误:', error);
            showWeatherError("加载天气数据失败");
        }
    }

    // 显示天气信息
    function displayWeatherInfo(locationName, weatherData, locationId) {
        const searchResults = document.getElementById('search-results');
        const selectedLocation = document.getElementById('selected-location');
        const weatherInfo = document.getElementById('weather-info');
        
        selectedLocation.textContent = `${locationName} - 天气信息`;
        
        weatherInfo.innerHTML = `
            <div class="weather-summary">
                <div class="current-weather">
                    <h4>当前天气</h4>
                    <p><strong>温度:</strong> ${weatherData.temp}°C</p>
                    <p><strong>体感温度:</strong> ${weatherData.feelsLike}°C</p>
                    <p><strong>天气:</strong> ${weatherData.text}</p>
                    <p><strong>湿度:</strong> ${weatherData.humidity}%</p>
                    <p><strong>风向:</strong> ${weatherData.windDir} ${weatherData.windSpeed}km/h</p>
                    <p><strong>气压:</strong> ${weatherData.pressure}hPa</p>
                    <p><strong>能见度:</strong> ${weatherData.vis}km</p>
                </div>
                <div class="weather-actions">
                    <a href="detail.html?location=${locationId}&name=${encodeURIComponent(locationName)}" class="btn">查看详细天气</a>
                </div>
            </div>
        `;
        
        searchResults.style.display = 'block';
        
        // 滚动到搜索结果
        searchResults.scrollIntoView({ behavior: 'smooth' });
    }

    // 显示天气错误信息
    function showWeatherError(message) {
        const searchResults = document.getElementById('search-results');
        const selectedLocation = document.getElementById('selected-location');
        const weatherInfo = document.getElementById('weather-info');
        
        selectedLocation.textContent = '天气信息';
        weatherInfo.innerHTML = `<p style="color: #e74c3c;">${message}</p>`;
        searchResults.style.display = 'block';
    }

    // 显示搜索结果区域
    function showSearchResults(locationName) {
        const searchResults = document.getElementById('search-results');
        const selectedLocation = document.getElementById('selected-location');
        
        selectedLocation.textContent = `${locationName} - 地图显示`;
        searchResults.style.display = 'block';
    }

    // 键盘事件处理
    function keydown(event) {
        var key = (event || window.event).keyCode;
        var result = document.getElementById("result1");
        var cur = result.curSelect;
        
        if (key === 40) { // down
            if (cur + 1 < result.childNodes.length) {
                if (result.childNodes[cur]) {
                    result.childNodes[cur].style.background = '';
                }
                result.curSelect = cur + 1;
                result.childNodes[cur + 1].style.background = '#CAE1FF';
                document.getElementById("keyword").value = result.tipArr[cur + 1].name;
            }
        } else if (key === 38) { // up
            if (cur - 1 >= 0) {
                if (result.childNodes[cur]) {
                    result.childNodes[cur].style.background = '';
                }
                result.curSelect = cur - 1;
                result.childNodes[cur - 1].style.background = '#CAE1FF';
                document.getElementById("keyword").value = result.tipArr[cur - 1].name;
            }
        } else if (key === 13) { // enter
            var res = document.getElementById("result1");
            if (res && res['curSelect'] !== -1) {
                selectResult(res.curSelect);
            }
        } else {
            autoSearch();
        }
    }

    // 搜索建议框鼠标事件
    window.openMarkerTipById = function(pointid, thiss) {
        thiss.style.background = '#CAE1FF';
    };

    window.onmouseout_MarkerStyle = function(pointid, thiss) {
        thiss.style.background = "";
    };

    window.selectResult = selectResult;
    window.keydown = keydown;

    // 初始化
    initMap();
    
    // 绑定搜索输入事件
    const keywordInput = document.getElementById("keyword");
    if (keywordInput) {
        keywordInput.onkeyup = keydown;
    }
});