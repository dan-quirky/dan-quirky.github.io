console.log("hello world")
//this block runs asynchronously, careful where vars are declared etc
fetch("./readings.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    document.getElementById("co2-value").innerHTML = data.co2._value;
    document.getElementById("co2-units").innerHTML = `ppm`;
    document.getElementById("co2-lastupdated").innerHTML = data.co2.lastUpdatedTime;

    document.getElementById("humidity-value").innerHTML = data.humidity._value;
    document.getElementById("humidity-units").innerHTML = `%`;
    document.getElementById("humidity-lastupdated").innerHTML = data.humidity.lastUpdatedTime;

    document.getElementById("temperature-value").innerHTML = data.temperature._value;
    document.getElementById("temperature-units").innerHTML = "\u2103";
    document.getElementById("temperature-lastupdated").innerHTML = data.temperature.lastUpdatedTime;
    
  })
  .catch((error) => console.error("Error loading JSON:", error));

console.log("done")