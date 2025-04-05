const readingsDataPromise = fetch("./readings.json") // fetch is asynchronous, returns promises resolving to response object
  .then(
    response => response.json(), // return promise resolving to response parsed as js object
    error => console.error("Error loading readings:",error) //error handling, but continue then chain
  )
  // .then(data => {
  //   console.log(data) //debug
  //   return data
  // })

export { readingsDataPromise }