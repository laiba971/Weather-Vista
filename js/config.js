// Configuration file for API keys and other settings
const config = {
    // Weather API configuration
    weather: {
        apiKey: '68240e84a03aa32b62fd41e6ddab7ac9',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        oneCallUrl: 'https://api.openweathermap.org/data/3.0/onecall'
    },
    
    // Default settings
    defaults: {
        location: {
            lat: 40.7128,
            lon: -74.0060,
            name: 'Islamabad',
            country: 'Pakistan'
        },
        units: 'metric' // 'metric' for Celsius, 'imperial' for Fahrenheit
    }
    
};
export default config;