//Select DOMS
const searchInput = document.querySelector(".searchbar")
const searchBtn = document.querySelector(".searchBtn")
const moviePoster = document.querySelector(".moviePoster")
const movieTitle = document.querySelector(".movieTitle")
const movieDesc = document.querySelector(".movieDesc")
const movieCast = document.querySelector(".movieCast")
const wikiDesc = document.querySelector(".wikiDesc")
const movieRating = document.querySelector(".movieRating")
const youTube = document.querySelector("#ytReviews")


var mytitle = JSON.parse(localStorage.getItem("myTitle"));
if (mytitle==undefined){
  mytitle =[];
}

var thetarget="";
let wikiRetry = false

//Init foundation
$(document).foundation()

//Init Button
searchBtn.addEventListener("click", movieSearch)
historyList()

//Main Function
function movieSearch(e){
    e.preventDefault()
    //localStorage.clear();

    let targetSearch = searchInput.value

    requestUrl = `https://www.omdbapi.com/?s=${targetSearch}&type=movie&apikey=83e0357b`

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
      //safeguard for "too many results"
      if (data.Error == "Too many results."){
        let tryUrl = `https://www.omdbapi.com/?t=${targetSearch}&apikey=83e0357b`
        fetch(tryUrl)
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          console.log(data);
          let title = data.Title
          let imbd = data.imdbID
          let year = data.Year
          movieTitle.style.opacity = "100";
          movieInfo.style.opacity = "100";
          movieRating.style.opacity = "100";
          youTube.style.opacity = "100"
          fetchRecentTitle(title, imbd, year)
        });
        return
      }
      //safeguard for nonsense words
      if (data.Response == "False" && data.Error != "Too many results."){
        movieTitle.innerText = "No Movie Found!";
        movieTitle.style.opacity = "100";
        movieInfo.style.opacity = "0";
        movieRating.style.opacity = "0";
        youTube.style.opacity = "0"
        return;
      }

    //unhide movie title and movie info.
    movieTitle.style.opacity = "100";
    movieInfo.style.opacity = "100";
    movieRating.style.opacity = "100";
    youTube.style.opacity = "100"
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
        if (data.Search[i].Year > mostRecentYear && data.Search[i].Year < 2024){
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
    let recentUrl = `https://www.omdbapi.com/?i=${id}&apikey=83e0357b`

    fetch(recentUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    ombdGenerate(data)
  });

  wikiRetry = false
  wikiSearch(title, date)

    //API key from youtube
    let apiKey = "AIzaSyB8T6yJh1CgWmYMbQZwBiZ7kWR6pRbGNpI"

    let search = title + date
    videoSearch(apiKey,search,5)
        
    //pulls data from search
  function videoSearch(apiKey,search,maxResults){
    $.get("https://www.googleapis.com/youtube/v3/search?key=" + apiKey + "&type=video&part=snippet&maxResults=" + maxResults + "&q=" + search,(data) => {
        let video = '';
        // Removes videos after each search
        $("#videos").html("");
        data.items.forEach(item => {
        //adds videos in separate ifram
        video = `
          <iframe width="420" height="315" src="https://www.youtube.com/embed/${item.id.videoId}" frameborder="0" allowfullscreen></iframe>
        `
        $("#videos").append(video)
        });
    })
  }
}

function ombdGenerate(data){

  saveMovie(data)//check it on the chrome
  movieTitle.innerText = data.Title
  moviePoster.src = data.Poster
  movieDesc.innerText = data.Plot
  // Added the actors
  movieCast.innerHTML = `<b>Cast:</b> ${data.Actors}`

  movieRating.innerHTML = ""
  for (let i=0; i<data.Ratings.length; i++){
    let newLi = document.createElement("li")
    let newLiContent = `<b>${data.Ratings[i].Source}</b> ${data.Ratings[i].Value}`
    newLi.innerHTML = newLiContent
    movieRating.appendChild(newLi)
  }
  
}


function wikiSearch(title, date){
  let wikiSearching = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${title} ${date}{&format=json&origin=*`

  fetch(wikiSearching)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    let article;

    if (data[1][0] === undefined && (data[0].includes("20") || data[0].includes("19")) && wikiRetry === false){
      wikiRetry = true
      wikiSearch(title, "")
      return
    }

    if(data[1][0] === undefined){
      wikiDesc.innerText = "There are no wikipedia entries for this movie"
      return
    }

    if(!data[1][0].includes(title) && wikiRetry === false){
      wikiRetry = true
      wikiSearch(title, "")
      return
    }

    for (let i=0; i<data.length; i++){
      if (data[i][0].includes("film") || data[i][0].includes("movie")){
        article = data[i][0]
        i=data.length
      } else article = data[1][0]
    }

    let link = data[3][0]

    wikiGet(article, link)
  });

}

function wikiGet(article, link){
  let wikiUrl = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=${article}&origin=*`

  fetch(wikiUrl)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    //gives us a wikipedia extract
    let wikiID = Object.getOwnPropertyNames(data.query.pages)[0]
    //sketchy, but can be used as a "click for more" type button
    let wikiLink = `en.wikipedia.org/wiki/${article}`
    //write wiki extract to screen with click for more link
    wikiDesc.innerHTML = `${data.query.pages[wikiID].extract} <a href="${link}" target="_blank">${wikiLink}</a>`
  });
}

function checkmylocalstorage(data) {
  if (localStorage.getItem(data)===null) {
    console.log("my local is empty");
    return 0;
  }
  else{
    console.log("my local has stuff");
    return 1;
  }
}

//this function is for saving in the local storage (like the weather forecaster)
//It is need it if this works with json
function saveMovie(data){
  localStorage.setItem(data.Title, JSON.stringify(data));
  if (!mytitle.includes(data.Title)){
    mytitle.push(data.Title)
    localStorage.setItem("myTitle", JSON.stringify(mytitle));
    historyList()
  }
}

//setting up our modal
function historyList(){
  const historyList = document.querySelector(".history-list")

  historyList.innerHTML = ""
  for (let i=0; i<mytitle.length; i++){
    let newList = document.createElement("button")
    let listContent = mytitle[i]
    newList.innerText = listContent
    newList.addEventListener("click", fetchHistory)
    newList.classList.add("historybtn")
    historyList.appendChild(newList)
  }
}

//handling modal clicks
function fetchHistory(e){
  let targetMovie = e.target.innerText
  let movieData = JSON.parse(localStorage.getItem(targetMovie))
  fetchRecentTitle(movieData.Title, movieData.imdbID, movieData.Year)
  movieTitle.style.opacity = "100";
  movieInfo.style.opacity = "100";
  movieRating.style.opacity = "100";
  youTube.style.opacity = "100"
}

