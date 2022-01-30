const searchResultContainer = document.querySelector(".search-results");
const nominationsContainer = document.querySelector(".nominations");
const resultTemplate = document.querySelector(".result-template");
const nominationTemplate = document.querySelector(".nomination-template");
const noNominationFoundTemplate = document.querySelector(
  ".no-nominations-found-template"
);
const tooManyResultsTemplate = document.querySelector(
  ".too-many-results-template"
);
const noMovieFoundTemplate = document.querySelector(".no-movie-found-template");

let nominationsArray = [];

const updateNominations = () => {
  while (nominationsContainer.firstChild) {
    nominationsContainer.removeChild(nominationsContainer.firstChild);
  }

  if (nominationsArray.length == 0) {
    const noNomination =
      noNominationFoundTemplate.content.cloneNode(true).children[0];
    nominationsContainer.append(noNomination);
  } else {
    nominationsArray.forEach((nomination) => {
      const nominationResult =
        nominationTemplate.content.cloneNode(true).children[0];
      const nominationTitle =
        nominationResult.querySelector(".nomination-title");
      nominationTitle.textContent = nomination.title;

      const nominationButton =
        nominationResult.querySelector(".nomination-button");
      nominationButton.addEventListener("click", (e) => {
        const nominationName =
          e.target.parentElement.parentElement.querySelector(
            ".nomination-title"
          ).textContent;
        let indexToRemove = -1;

        console.log(nominationName);
        for (let i = 0; i < nominationsArray.length; ++i) {
          if (nominationsArray[i].title === nominationName) {
            indexToRemove = i;
            break;
          }
        }
        if (indexToRemove > -1) {
          nominationsArray.splice(indexToRemove, 1);
        }

        // enable add button for deleted movie in case they're still on the search page for it
        const currentSearchResults = document.querySelectorAll(".result-card");
        console.log(currentSearchResults);

        for (let i = 0; i < currentSearchResults.length; ++i) {
          console.log(currentSearchResults[i]);
          if (
            currentSearchResults[i].querySelector(".result-title")
              .textContent === nominationName
          ) {
            currentSearchResults[i].querySelector(
              ".result-button"
            ).disabled = false;
          }
        }

        console.log(nominationsArray);

        updateNominations();
      });

      nominationsContainer.append(nominationResult);
    });
  }

  console.log(nominationsArray);
};

updateNominations();

const searchBar = document.querySelector("#search-bar");
searchBar.addEventListener("input", (e) => {
  const searchValue = e.target.value;

  //   if (searchValue === "") {
  //       break;
  //   }

  // clear searchResultContainer
  while (searchResultContainer.firstChild) {
    searchResultContainer.removeChild(searchResultContainer.firstChild);
  }

  fetch(`http://www.omdbapi.com/?s=${searchValue}&apikey=b3909245`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      dataArray = data.Search;

      //   console.log(dataArray);

      if (dataArray) {
        dataArray.forEach((result) => {
          const searchResult =
            resultTemplate.content.cloneNode(true).children[0];

          const resultTitle = searchResult.querySelector(".result-title");
          resultTitle.textContent = `${result.Title} (${result.Year})`;
          const resultButton = searchResult.querySelector(".result-button");
          resultButton.addEventListener("click", (e) => {
            nominationsArray.push({
              title: `${result.Title} (${result.Year})`,
              poster: result.Poster,
              imdbID: result.imdbID,
            });
            updateNominations();

            if (e.target.classList.contains("result-button")) {
              e.target.disabled = true;
            } else {
              e.target.parentElement.disabled = true;
            }
          });

          if (alreadyNominated(result.imdbID)) {
            // console.log(result.imdbID);
            // console.log(e.target);
            resultButton.disabled = true;
          }

          searchResultContainer.append(searchResult);
        });
      } else {
        if (data.Response === "False") {
          if (data.Error.toLowerCase().includes("movie not found")) {
            console.log("Movie not found error");
            const movieNotFoundResponse =
              noMovieFoundTemplate.content.cloneNode(true).children[0];
            searchResultContainer.append(movieNotFoundResponse);
          } else {
            console.log("Too many results error");
            const tooManyResultsResponse =
              tooManyResultsTemplate.content.cloneNode(true).children[0];
            searchResultContainer.append(tooManyResultsResponse);
          }
        }
      }
    });
});

const alreadyNominated = (movieID) => {
  console.log("Checking nomination..");
  //   console.log("Checking ID: " + movieID);
  for (let i = 0; i < nominationsArray.length; ++i) {
    console.log(`Checking ${nominationsArray[i].imdbID} with ${movieID}`);
    if (nominationsArray[i].imdbID == movieID) {
      return true;
    }
  }

  //   for (let nomination in nominationsArray) {
  //     console.log(nominationsArray);
  //     console.log(nomination);

  //   }
  return false;
};

const downloadCSV = () => {
  var csv = "Movie Name, Imdb ID, Poster URL\n";
  nominationsArray.forEach((nomination) => {
    csv += `${nomination.title},${nomination.imdbID},${nomination.poster}`;
    csv += "\n";
  });

  //   document.write(csv);

  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  hiddenElement.target = "_blank";

  //provide the name for the CSV file to be downloaded
  hiddenElement.download = "The Shoppies Nominations.csv";
  hiddenElement.click();
};
