// Fetch based on search data -> search data will give us the name of the movie -> search omdb for specific reviews && wikipedia for exerp
//Select DOMS
const searchInput = document.querySelector(".searchbar")
const searchBtn = document.querySelector(".button")
const moviePoster = document.querySelector(".moviePoster")
const movieTitle = document.querySelector(".movieTitle")
const movieDesc = document.querySelector(".movieDesc")
const wikiDesc = document.querySelector(".wikiDesc")
const movieRating = document.querySelector(".movieRating")

//Init Button
searchBtn.addEventListener("click", movieSearch)

//Main Function
function movieSearch(e){
    e.preventDefault()
    
    let targetSearch = searchInput.value
    requestUrl = `http://www.omdbapi.com/?s=${targetSearch}&type=movie&apikey=83e0357b`

//API EXAMPLES
//let requestUrl = "https://www.googleapis.com/youtube/v3/search?type=video&q=hulk&key=AIzaSyCvlhMpYCLCu1uS68KJ7BSQv8rRG_XacUw"
//let requestUrl = "http://www.omdbapi.com/?i=tt10857160&apikey=83e0357b"
//let requestUrl =  "http://en.wikipedia.org/w/api.php?action=opensearch&search=Hulk&format=json&origin=*"
//let requestUrl =  "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=Hulk&origin=*"

fetch(requestUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    findRecentTitle(data)
  });


}

//Cascading fetch functions
function findRecentTitle(data){
    //Loop handling our finding of the most recent version of that movie
    let mostRecentTitle;
    let imbdID;
    let mostRecentYear = 0

    for (let i=0; i<data.Search.length; i++){
        if (data.Search[i].Year > mostRecentYear){
            imbdID = data.Search[i].imdbID
            mostRecentTitle = data.Search[i].Title
            mostRecentYear = data.Search[i].Year
        }
    }

    //Passing in our most recent title and the IMBD id into our cascading fetch function
    fetchRecentTitle(mostRecentTitle, imbdID, mostRecentYear)
}

//Use the data we get from OMBD to search up more information on the movie
function fetchRecentTitle(title, id, date){
    //Use the IMBD ID to more specifically look up the movie on OMBD
    let recentUrl = `http://www.omdbapi.com/?i=${id}&apikey=83e0357b`

    fetch(recentUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    //do things with the data here
    //etc... this object has like everything about the movie
    ombdGenerate(data)

  });

    //Our API search for wikipedia using the movie title//Add url to wiki search
    //need wiki search url in addition that lets us query wikipedia and search for the film
    //let requestUrl =  "http://en.wikipedia.org/w/api.php?action=opensearch&search=Hulk&format=json&origin=*"
    let wikiUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}&origin=*`

    fetch(wikiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    //do things with the data here
    console.log(data);
    //gives us a wikipedia extract
    //build wikipedia algorithm that searches out the film tag and prefers that if available
    let wikiID = Object.getOwnPropertyNames(data.query.pages)[0]
    console.log(data.query.pages[wikiID].extract)
    //sketchy, but can be used as a "click for more" type button
    let wikiLink = `en.wikipedia.org/wiki/${title}`
    console.log(wikiLink)
    //write wiki extract to screen with click for more link
  });

  //Insert youtube stuff here

}

function ombdGenerate(data){
  movieTitle.innerText = data.Title
  moviePoster.src = data.Poster
  movieDesc.innerText = data.Plot

  for (let i=0; i<data.Ratings.length; i++){
    let newLi = document.createElement("li")
    let newLiContent = `<b>${data.Ratings[i].Source}</b> ${data.Ratings[i].Value}`
    newLi.innerHTML = newLiContent
    movieRating.appendChild(newLi)
  }
  
}