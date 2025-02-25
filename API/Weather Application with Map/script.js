// script.js
let map; // Declare map variable globally so it can be accessed by other functions

// Function: getWeather()
// Purpose: Fetches weather data from the OpenWeatherMap API based on the city entered by the user.
function getWeather() {
    const apiKey = 'e9e768bbd4ed209bf69d8403060724f2'; // Your OpenWeatherMap API key (REPLACE WITH YOUR ACTUAL KEY)
    const city = document.getElementById('city').value; // Get the city name from the input field

    if (!city) { // Check if the city input is empty
        alert('Please enter a city');
        return; // Exit the function if the input is empty
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`; // URL for current weather data
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`; // URL for forecast data

    // Use Promise.all to make both API calls concurrently
    Promise.all([
        fetch(currentWeatherUrl).then(response => response.json()), // Fetch current weather data and parse the JSON response
        fetch(forecastUrl).then(response => response.json()) // Fetch forecast data and parse the JSON response
    ])
    .then(([currentWeatherData, forecastData]) => { // When both API calls are successful
        displayWeather(currentWeatherData); // Call function to display current weather
        displayHourlyForecast(forecastData.list); // Call function to display hourly forecast
    })
    .catch(error => { // If there's an error with either API call
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again.');
    });
}

// Function: displayWeather(data)
// Purpose: Displays the current weather information on the page.
function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div'); // Get the temperature display element
    const weatherInfoDiv = document.getElementById('weather-info'); // Get the weather info display element
    const weatherIcon = document.getElementById('weather-icon'); // Get the weather icon element

    weatherInfoDiv.innerHTML = ''; // Clear previous content
    tempDivInfo.innerHTML = ''; // Clear previous content

    if (data.cod === '404') { // Check for "city not found" error
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`; // Display the error message
        if (map) map.remove(); // Remove the map if the city is not found
    } else { // If the city is found
        const cityName = data.name; // Extract city name
        const temperature = Math.round(data.main.temp - 273.15); // Extract and convert temperature (Kelvin to Celsius)
        const description = data.weather[0].description; // Extract weather description
        const iconCode = data.weather[0].icon; // Extract weather icon code
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // Construct the URL for the weather icon
        const latitude = data.coord.lat; // Extract latitude
        const longitude = data.coord.lon; // Extract longitude

        tempDivInfo.innerHTML = `<p>${temperature}°C</p>`; // Display the temperature
        weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`; // Display city name and description
        weatherIcon.src = iconUrl; // Set the weather icon image source
        weatherIcon.alt = description; // Set the weather icon alt text
        weatherIcon.style.display = 'block'; // Make the weather icon visible

        initMap(latitude, longitude, cityName); // Initialize or update the map
    }
}


// Function: displayHourlyForecast(hourlyData)
// Purpose: Displays the hourly weather forecast on the page.
function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast'); // Get the hourly forecast display element
    hourlyForecastDiv.innerHTML = ''; // Clear previous forecast data

    const next24Hours = hourlyData.slice(0, 8); // Get the forecast data for the next 24 hours (8 data points, each 3 hours apart)

    next24Hours.forEach(item => { // Loop through each hourly forecast item
        const dateTime = new Date(item.dt * 1000); // Convert the timestamp to a Date object
        let hour = dateTime.getHours(); // Get the hour
        const minutes = dateTime.getMinutes(); // Get the minutes

        const ampm = hour >= 12 ? 'PM' : 'AM'; // Determine AM/PM
        hour = hour % 12; // Convert to 12-hour format
        hour = hour ? hour : 12; // Handle midnight (0 % 12 = 0)
        const formattedTime = `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`; // Format the time

        const temperature = Math.round(item.main.temp - 273.15); // Extract and convert temperature
        const iconCode = item.weather[0].icon; // Extract icon code
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`; // Construct icon URL

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${formattedTime}</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml; // Add the hourly item to the forecast container
    });
}

// Function: initMap(latitude, longitude, cityName)
// Purpose: Initializes or updates the Leaflet map.
function initMap(latitude, longitude, cityName) {
    if (map) { // Check if a map already exists
        map.remove(); // Remove the existing map instance to avoid multiple maps
    }

    map = L.map('map').setView([latitude, longitude], 13); // Create a new map and set the center and zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Add a tile layer (the visual map)
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map) // Add a marker to the map at the city's location
        .bindPopup(cityName) // Add a popup that displays the city name when the marker is clicked
        .openPopup(); // Open the popup by default
}

// Function: updateTime()
// Purpose: Updates the displayed time on the page.
function updateTime() {
    const currentTimeDiv = document.getElementById('current-time'); // Get the current time display element
    const now = new Date(); // Get the current date and time

    const timeOptions = { hour: '2-digit', minute: '2-digit' }; // Options for formatting the time
    const formattedTime = now.toLocaleTimeString([], timeOptions); // Format the time using locale settings

    const dateOptions = { year: 'numeric', month: 'long', day: '2-digit' }; // Options for formatting the date
    const formattedDate = now.toLocaleDateString([], dateOptions);  // Format the date using locale settings

    currentTimeDiv.textContent = `${formattedDate} ${formattedTime}`; // Update the time display element with the formatted date and time
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Call initially to display time on load