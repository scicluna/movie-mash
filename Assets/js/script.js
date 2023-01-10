// Fetch based on search data -> search data will give us the name of the movie -> search omdb for specific reviews && wikipedia for exerp
//Select DOMS
const searchInput = document.querySelector(".searchbar")
const searchBtn = document.querySelector(".searchbtn")

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
    fetchRecentTitle(mostRecentTitle, imbdID)
}

//Use the data we get from OMBD to search up more information on the movie
function fetchRecentTitle(title, id){
    //Use the IMBD ID to more specifically look up the movie on OMBD
    let recentUrl = `http://www.omdbapi.com/?i=${id}&apikey=83e0357b`

    fetch(recentUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    //do things with the data here
    //Display poster
    //Movie ratings
    //Movie Summary
    //Run time
    //etc... this object has like everything about the movie
    console.log(data);
  });

    //Our API search for wikipedia using the movie title
    let wikiUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${title}&origin=*`

    fetch(wikiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    //do things with the data here
    console.log(data);
    //gives us a wikipedia extract
    let wikiID = Object.getOwnPropertyNames(data.query.pages)[0]
    console.log(data.query.pages[wikiID].extract)
    //sketchy, but can be used as a "click for more" type button
    let wikiLink = `en.wikipedia.org/wiki/${title}`
    console.log(wikiLink)
    //write wiki extract to screen with click for more link
  });

  //Insert youtube stuff here

}