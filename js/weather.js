import config from './config.js';

// DOM Elements
const searchLocationInput = document.getElementById('search-location');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const hourlyForecastContainer = document.getElementById('hourly-forecast-container');
const weeklyForecastContainer = document.getElementById('weekly-forecast-container');
const forecastLocationSelect = document.getElementById('forecast-location');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// In weather.js
const WEATHER_API_KEY = config.weather.apiKey;
const WEATHER_API_URL = config.weather.baseUrl;
const WEATHER_ONECALL_URL = config.weather.oneCallUrl;

// And update the forecast API call
const forecastResponse = await fetch(
    `${WEATHER_ONECALL_URL}?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=${config.defaults.units}&exclude=minutely&appid=${WEATHER_API_KEY}`
);


// Default location
let currentLocation = {
    lat: 40.7128,
    lon: -74.0060,
    name: 'Islamabad ',
    country: 'Pakistan'
};

// Weather icons mapping
const weatherIcons = {
    '01d': 'fa-sun',
    '01n': 'fa-moon',
    '02d': 'fa-cloud-sun',
    '02n': 'fa-cloud-moon',
    '03d': 'fa-cloud',
    '03n': 'fa-cloud',
    '04d': 'fa-cloud',
    '04n': 'fa-cloud',
    '09d': 'fa-cloud-showers-heavy',
    '09n': 'fa-cloud-showers-heavy',
    '10d': 'fa-cloud-sun-rain',
    '10n': 'fa-cloud-moon-rain',
    '11d': 'fa-bolt',
    '11n': 'fa-bolt',
    '13d': 'fa-snowflake',
    '13n': 'fa-snowflake',
    '50d': 'fa-smog',
    '50n': 'fa-smog'
};

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Initialize weather data
function initWeather() {
    // Only fetch weather data if user is authenticated
    if (!isAuthenticated()) {
        return;
    }
    
    // Get user's location if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                currentLocation.lat = position.coords.latitude;
                currentLocation.lon = position.coords.longitude;
                
                // Get location name from coordinates
                getLocationNameFromCoords(currentLocation.lat, currentLocation.lon)
                    .then(() => {
                        // Fetch weather data
                        fetchWeatherData();
                    });
            },
            error => {
                console.error('Geolocation error:', error);
                // Use default location
                fetchWeatherData();
            }
        );
    } else {
        // Geolocation not supported, use default location
        fetchWeatherData();
    }
}

// Get location name from coordinates
async function getLocationNameFromCoords(lat, lon) {
    try {
        const response = await fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        currentLocation.name = data.name;
        currentLocation.country = data.sys.country;
        
        console.log(`Location resolved: ${currentLocation.name}, ${currentLocation.country}`);
    } catch (error) {
        console.error('Error getting location name:', error);
        // Keep default location name if there's an error
    }
}

// Fetch weather data
async function fetchWeatherData() {
    // Only fetch weather data if user is authenticated
    if (!isAuthenticated()) {
        return;
    }
    
    let useMockData = false;

    try {
        console.log(`Fetching weather for: ${currentLocation.name} (${currentLocation.lat}, ${currentLocation.lon})`);
        
        // Fetch current weather
        const currentWeatherResponse = await fetch(
            `${WEATHER_API_URL}/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=metric&appid=${WEATHER_API_KEY}`
        );
        
        if (!currentWeatherResponse.ok) {
            throw new Error(`Current weather API error: ${currentWeatherResponse.status}`);
        }
        
        // Fetch forecast data (One Call API)
        const forecastResponse = await fetch(
            `${WEATHER_API_URL}/onecall?lat=${currentLocation.lat}&lon=${currentLocation.lon}&units=metric&exclude=minutely&appid=${WEATHER_API_KEY}`
        );
        
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status}`);
        }
        
        const currentWeatherData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();
        
        console.log('Current weather data:', currentWeatherData);
        console.log('Forecast data:', forecastData);
        
        // Update UI with weather data
        updateCurrentWeather(currentWeatherData);
        updateHourlyForecast(forecastData.hourly);
        updateWeeklyForecast(forecastData.daily);
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        
        // If API call fails, try using mock data
        alert(`Weather API error: ${error.message}. Using mock data instead.`);
        useMockData = true;
    }

    if (useMockData) {
        useMockWeatherData();
    }
}

// Search for location
async function searchLocation(query) {
    // Only search if user is authenticated
    if (!isAuthenticated()) {
        alert('Please login to search for locations.');
        return;
    }
    
    try {
        console.log(`Searching for location: ${query}`);
        
        const response = await fetch(
            `${WEATHER_API_URL}/weather?q=${query}&units=metric&appid=${WEATHER_API_KEY}`
        );
        
        if (!response.ok) {
            throw new Error(`Location search API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Location search result:', data);
        
        // Update current location
        currentLocation = {
            lat: data.coord.lat,
            lon: data.coord.lon,
            name: data.name,
            country: data.sys.country
        };
        
        console.log(`Location updated to: ${currentLocation.name}, ${currentLocation.country}`);
        
        // Fetch weather data for new location
        fetchWeatherData();
        
    } catch (error) {
        console.error('Error searching location:', error);
        alert(`Location not found: ${error.message}. Please try again.`);
    }
}

// Update current weather UI
function updateCurrentWeather(data) {
    if (!weatherDisplay) return;
    
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const iconCode = data.weather[0].icon;
    const iconClass = weatherIcons[iconCode] || 'fa-cloud';
    
    weatherDisplay.innerHTML = `
        <div class="location-info">
            <h3>${data.name}, ${data.sys.country}</h3>
            <p class="date">${formattedDate}</p>
        </div>
        <div class="weather-info">
            <div class="temperature">
                <span class="temp">${Math.round(data.main.temp)}°C</span>
                <span class="feels-like">Feels like: ${Math.round(data.main.feels_like)}°C</span>
            </div>
            <div class="weather-icon">
                <i class="fas ${iconClass} fa-4x"></i>
                <p>${data.weather[0].description}</p>
            </div>
        </div>
        <div class="weather-details">
            <div class="detail">
                <i class="fas fa-wind"></i>
                <span>Wind: ${Math.round(data.wind.speed * 3.6)} km/h</span>
            </div>
            <div class="detail">
                <i class="fas fa-tint"></i>
                <span>Humidity: ${data.main.humidity}%</span>
            </div>
            <div class="detail">
                <i class="fas fa-compress-arrows-alt"></i>
                <span>Pressure: ${data.main.pressure} hPa</span>
            </div>
            <div class="detail">
                <i class="fas fa-eye"></i>
                <span>Visibility: ${(data.visibility / 1000).toFixed(1)} km</span>
            </div>
        </div>
    `;
}

// Update hourly forecast UI
function updateHourlyForecast(hourlyData) {
    if (!hourlyForecastContainer) return;
    
    // Clear previous data
    hourlyForecastContainer.innerHTML = '';
    
    // Only show next 8 hours
    const next8Hours = hourlyData.slice(0, 8);
    
    next8Hours.forEach((hour, index) => {
        const time = new Date(hour.dt * 1000);
        const formattedTime = index === 0 ? 'Now' : time.toLocaleTimeString('en-US', { hour: 'numeric' });
        
        const iconCode = hour.weather[0].icon;
        const iconClass = weatherIcons[iconCode] || 'fa-cloud';
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'forecast-item';
        hourlyItem.innerHTML = `
            <p class="time">${formattedTime}</p>
            <i class="fas ${iconClass}"></i>
            <p class="temp">${Math.round(hour.temp)}°C</p>
        `;
        
        hourlyForecastContainer.appendChild(hourlyItem);
    });
}

// Update weekly forecast UI
function updateWeeklyForecast(dailyData) {
    if (!weeklyForecastContainer) return;
    
    // Clear previous data
    weeklyForecastContainer.innerHTML = '';
    
    // Skip today, show next 7 days
    const next7Days = dailyData.slice(1, 8);
    
    next7Days.forEach(day => {
        const date = new Date(day.dt * 1000);
        const formattedDay = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const iconCode = day.weather[0].icon;
        const iconClass = weatherIcons[iconCode] || 'fa-cloud';
        
        const dailyItem = document.createElement('div');
        dailyItem.className = 'forecast-item weekly';
        dailyItem.innerHTML = `
            <p class="day">${formattedDay}</p>
            <i class="fas ${iconClass}"></i>
            <div class="temp-range">
                <span class="max">${Math.round(day.temp.max)}°C</span>
                <span class="min">${Math.round(day.temp.min)}°C</span>
            </div>
        `;
        
        weeklyForecastContainer.appendChild(dailyItem);
    });
}

// Use mock weather data for demo purposes
function useMockWeatherData() {
    console.log('Using mock weather data for:', currentLocation.name);
    
    const mockCurrentWeather = {
        name: currentLocation.name,
        sys: {
            country: currentLocation.country
        },
        main: {
            temp: 24,
            feels_like: 26,
            humidity: 65,
            pressure: 1015
        },
        weather: [
            {
                description: 'Partly Cloudy',
                icon: '02d'
            }
        ],
        wind: {
            speed: 1.5 // m/s
        },
        visibility: 10000
    };
    
    const mockHourlyForecast = [
        { dt: Date.now() / 1000, temp: 24, weather: [{ icon: '02d' }] },
        { dt: (Date.now() / 1000) + 3600, temp: 25, weather: [{ icon: '03d' }] },
        { dt: (Date.now() / 1000) + 7200, temp: 26, weather: [{ icon: '02d' }] },
        { dt: (Date.now() / 1000) + 10800, temp: 27, weather: [{ icon: '01d' }] },
        { dt: (Date.now() / 1000) + 14400, temp: 26, weather: [{ icon: '01d' }] },
        { dt: (Date.now() / 1000) + 18000, temp: 25, weather: [{ icon: '02d' }] },
        { dt: (Date.now() / 1000) + 21600, temp: 23, weather: [{ icon: '03d' }] },
        { dt: (Date.now() / 1000) + 25200, temp: 22, weather: [{ icon: '03d' }] }
    ];
    
    const today = new Date();
    const mockDailyForecast = Array.from({ length: 8 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        return {
            dt: date.getTime() / 1000,
            temp: {
                min: 18 + Math.floor(Math.random() * 5),
                max: 24 + Math.floor(Math.random() * 5)
            },
            weather: [
                { icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)] }
            ]
        };
    });
    
    updateCurrentWeather(mockCurrentWeather);
    updateHourlyForecast(mockHourlyForecast);
    updateWeeklyForecast(mockDailyForecast);
}

// Event listeners
if (searchBtn && searchLocationInput) {
    searchBtn.addEventListener('click', () => {
        const query = searchLocationInput.value.trim();
        if (query) {
            searchLocation(query);
        }
    });
    
    searchLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchLocationInput.value.trim();
            if (query) {
                searchLocation(query);
            }
        }
    });
}

// Tab functionality for forecast page
if (tabButtons.length > 0 && tabContents.length > 0) {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Location selector in forecast page
if (forecastLocationSelect) {
    forecastLocationSelect.addEventListener('change', () => {
        const selectedLocation = forecastLocationSelect.value;
        
        if (selectedLocation === 'current') {
            // Use current location
            initWeather();
        } else {
            // Use selected location
            searchLocation(selectedLocation);
        }
    });
}

// Initialize weather on page load
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize weather if user is authenticated
    if (isAuthenticated()) {
        console.log('Initializing weather data...');
        initWeather();
    }
});

// Listen for authentication changes
window.addEventListener('storage', (event) => {
    if (event.key === 'token') {
        if (event.newValue) {
            // User logged in
            console.log('User logged in, initializing weather data...');
            initWeather();
        }
    }
});