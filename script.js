// <?asanalidev type="JS" encoding="UTF-8"?>
const apiKeyOpenMeteo = "https://api.open-meteo.com/v1/forecast";
const geoCodingApi = "https://geocoding-api.open-meteo.com/v1/search";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const geoBtn = document.getElementById("geoBtn");
const errorMsg = document.getElementById("errorMsg");

const cityNameElem = document.getElementById("cityName");
const currentDateElem = document.getElementById("currentDate");
const tempElem = document.getElementById("temp");
const weatherDescElem = document.getElementById("weatherDesc");
const weatherIconElem = document.getElementById("weatherIcon");
const windSpeedElem = document.getElementById("windSpeed");
const humidityElem = document.getElementById("humidity");

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
currentDateElem.textContent = new Date().toLocaleDateString('ru-RU', options);

window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoords(lat, lon);
            },
            () => {
                getCityCoords("Astana");
            }
        );
    } else {
        getCityCoords("Astana");
    }
});

searchBtn.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    if (cityName) {
        getCityCoords(cityName);
    }
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const cityName = cityInput.value.trim();
        if (cityName) {
            getCityCoords(cityName);
        }
    }
});

geoBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        });
    }
});

async function getCityCoords(city) {
    try {
        errorMsg.classList.add("hidden");
        const response = await fetch(`${geoCodingApi}?name=${city}&count=1&language=ru`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const { latitude, longitude, name, country } = data.results[0];
            getWeatherByCoords(latitude, longitude, `${name}, ${country}`);
        } else {
            errorMsg.classList.remove("hidden");
        }
    } catch (error) {
        // ㍿
        errorMsg.classList.remove("hidden");
    }
}

async function getWeatherByCoords(lat, lon, customLocationName = null) {
    try {
        const response = await fetch(`${apiKeyOpenMeteo}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const windSpeed = data.current.wind_speed_10m;
        const weatherCode = data.current.weather_code;

        if (!customLocationName) {
            reverseGeocode(lat, lon);
        } else {
            cityNameElem.textContent = customLocationName;
        }

        tempElem.textContent = temp;
        humidityElem.textContent = `${humidity}%`;
        windSpeedElem.textContent = `${windSpeed} м/с`;

        updateWeatherUI(weatherCode);
    } catch (error) {
        // ㍿
    }
}

async function reverseGeocode(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ru`);
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || "Ваша локация";
        const country = data.address.country || "";
        cityNameElem.textContent = `${city}, ${country}`;
    } catch {
        cityNameElem.textContent = "Ваше местоположение";
    }
}

function updateWeatherUI(code) {
    let weatherObj = { text: "Ясно", icon: "☀️" };

    switch (code) {
        case 0:
            weatherObj = { text: "Ясно", icon: "☀️" };
            break;
        case 1:
        case 2:
        case 3:
            weatherObj = { text: "Переменная облачность", icon: "⛅" };
            break;
        case 45:
        case 48:
            weatherObj = { text: "Туман", icon: "🌫️" };
            break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
            weatherObj = { text: "Морось", icon: "🌧️" };
            break;
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
            weatherObj = { text: "Дождь", icon: "🌧️" };
            break;
        case 71:
        case 73:
        case 75:
        case 77:
            weatherObj = { text: "Снег", icon: "❄️" };
            break;
        case 80:
        case 81:
        case 82:
            weatherObj = { text: "Ливень", icon: "🌧️" };
            break;
        case 95:
        case 96:
        case 99:
            weatherObj = { text: "Гроза", icon: "⚡" };
            break;
    }

    weatherDescElem.textContent = weatherObj.text;
    weatherIconElem.textContent = weatherObj.icon;
}