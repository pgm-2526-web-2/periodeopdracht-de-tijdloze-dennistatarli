(() => {
  const API = "https://www.pgm.gent/data/tijdloze/tijdloze.json";
  const tabs = document.querySelectorAll(".list__tab"); // Underlining
  const list = document.querySelector(".list__items"); // "Top 100" (default) tab
  const tabTop = document.querySelector(`.list__tab[data-tab="top"]`); // "Top 100" tab
  const tabExit = document.querySelector(`.list__tab[data-tab="exit"]`); // "Exit" tab
  const tabNew = document.querySelector(`.list__tab[data-tab="new"]`); // "New in"

  if (!list) return;

  // Load all correct songs
  const loadTabs = async () => {
    try {
      // Fetch data
      const res = await fetch(API);
      const songs = await res.json();

      // Years
      const years = Object.keys(songs[0]) // Take first song object to read data (specifically keys)
        .filter((key) => key.startsWith("position")) // Filter only keys starting with "position"
        .map((key) => Number(key.replace("position", ""))); // Replace "position" with empty ""

      // Get correct years for filtering this year' songs & calculating difference in ranking
      const year = years[years.length - 1]; // Get last year of song (last = most recent)
      const previousYear = years[years.length - 2]; // Get voorlaatste year of song (2023)

      // Top 100
      const top100 = songs
        // Filter songs where rank is 1 - 100
        .filter((song) => {
          const position = song[`position${year}`]; // Take song with year 2024 (last index)
          return position >= 1 && position <= 100; // Only songs that are in top 100
        })
        .sort((a, b) => a[`position${year}`] - b[`position${year}`]); // Sort ascending

      // Exit
      const exits = songs
        // Filter songs from 2023 and 2024
        .filter((song) => {
          const previousPosition = song[`position${previousYear}`]; // 2023
          const currentPosition = song[`position${year}`]; // 2024 (avoid same songs in "Exit" and "New in")
          return (
            // Return songs that are/were in rank 1 - 100
            previousPosition >= 1 &&
            previousPosition <= 100 &&
            currentPosition > 100
          );
        });

      // New in (opposit of "Exits")
      const newIn = songs.filter((song) => {
        const previousPosition = song[`position${previousYear}`]; // 2023 (avoid same songs in "Exit" and "New in")
        const currentPosition = song[`position${year}`]; // 2024
        return (
          currentPosition >= 1 &&
          currentPosition <= 100 &&
          previousPosition > 100
        );
      });

      // Render all songs
      const renderSongs = (data, activeTab) => {
        // Active state
        tabs.forEach((tab) => tab.classList.remove("list__tab--active")); // First remove underlining other tabs
        document
          .querySelector(`.list__tab[data-tab="${activeTab}"]`)
          .classList.add("list__tab--active"); // Add underlining selected tab

        // Read "favorite" songs in localStorage
        const getFavorites = () =>
          JSON.parse(localStorage.getItem("favorites")); // Convert string of favorite songs in array

        // Render HTML
        let html = "";

        // Loop all songs for all tabs
        data.forEach((song) => {
          // Add "favorite" song
          const favorites = getFavorites(); // Get favorite songs
          const isFav = favorites.includes(song.song_id); // Check if favorite song is already in list of favorites

          const currentPosition = song[`position${year}`];
          const previousPosition = song[`position${previousYear}`];

          // Floating badge
          let badge = "";
          if (activeTab === "top") {
            badge =
              previousPosition === null
                ? "NIEUW" // Some songs are null -> list as "NIEUW"
                : previousPosition - currentPosition; // Otherwise calculate its rank difference from previous year
          }
          if (activeTab === "exit") badge = "EXIT"; // Badge is "EXIT" in tab "Exits"
          if (activeTab === "new") badge = "NIEUW"; // Badge is "NIEUW" in tab "NEw in"

          html += `
    <article class="list__item">
      <span class="list__rank">
        <span class="list__rank-number">${currentPosition}</span>
        <span class="list__rank-badge">${badge}</span>
      </span>

      <div class="list__song">
        <h2 class="list__title">${song.song_title}</h2>
        <a href="./artist.html?id=${song.artist_id}" class="list__artist">${song.name}</a>

        <p class="list__album">
          <span class="list__album-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                viewBox="0 0 17 17" fill="none">
                <path
                d="M8.125 0C6.51803 0 4.94714 0.476523 3.611 1.36931C2.27485 2.2621 1.23344 3.53105 0.618482 5.0157C0.00352044 6.50035 -0.157382 8.13401 0.156123 9.71011C0.469628 11.2862 1.24346 12.7339 2.37976 13.8702C3.51606 15.0065 4.9638 15.7804 6.5399 16.0939C8.11599 16.4074 9.74966 16.2465 11.2343 15.6315C12.719 15.0166 13.9879 13.9752 14.8807 12.639C15.7735 11.3029 16.25 9.73197 16.25 8.125C16.2477 5.97081 15.391 3.90551 13.8677 2.38227C12.3445 0.85903 10.2792 0.00227486 8.125 0ZM8.125 15C6.76526 15 5.43605 14.5968 4.30546 13.8414C3.17487 13.0859 2.29368 12.0122 1.77333 10.7559C1.25298 9.49971 1.11683 8.11737 1.3821 6.78375C1.64738 5.45013 2.30216 4.22513 3.26364 3.26364C4.22513 2.30216 5.45014 1.64737 6.78376 1.3821C8.11738 1.11683 9.49971 1.25298 10.756 1.77333C12.0122 2.29368 13.0859 3.17487 13.8414 4.30545C14.5968 5.43604 15 6.76525 15 8.125C14.9979 9.94773 14.2729 11.6952 12.9841 12.9841C11.6952 14.2729 9.94773 14.9979 8.125 15ZM8.125 3.75C6.96506 3.75124 5.85298 4.21258 5.03278 5.03278C4.21258 5.85298 3.75124 6.96506 3.75 8.125C3.75 8.29076 3.68416 8.44973 3.56695 8.56694C3.44973 8.68415 3.29076 8.75 3.125 8.75C2.95924 8.75 2.80027 8.68415 2.68306 8.56694C2.56585 8.44973 2.5 8.29076 2.5 8.125C2.50166 6.63367 3.09482 5.20389 4.14936 4.14935C5.20389 3.09482 6.63367 2.50165 8.125 2.5C8.29076 2.5 8.44974 2.56585 8.56695 2.68306C8.68416 2.80027 8.75 2.95924 8.75 3.125C8.75 3.29076 8.68416 3.44973 8.56695 3.56694C8.44974 3.68415 8.29076 3.75 8.125 3.75ZM13.75 8.125C13.7483 9.61633 13.1552 11.0461 12.1007 12.1006C11.0461 13.1552 9.61634 13.7483 8.125 13.75C7.95924 13.75 7.80027 13.6842 7.68306 13.5669C7.56585 13.4497 7.5 13.2908 7.5 13.125C7.5 12.9592 7.56585 12.8003 7.68306 12.6831C7.80027 12.5658 7.95924 12.5 8.125 12.5C9.28494 12.4988 10.397 12.0374 11.2172 11.2172C12.0374 10.397 12.4988 9.28494 12.5 8.125C12.5 7.95924 12.5659 7.80027 12.6831 7.68306C12.8003 7.56585 12.9592 7.5 13.125 7.5C13.2908 7.5 13.4497 7.56585 13.5669 7.68306C13.6842 7.80027 13.75 7.95924 13.75 8.125ZM10.625 8.125C10.625 7.63055 10.4784 7.1472 10.2037 6.73607C9.92897 6.32495 9.53853 6.00452 9.08171 5.8153C8.6249 5.62608 8.12223 5.57657 7.63728 5.67304C7.15233 5.7695 6.70687 6.0076 6.35724 6.35723C6.00761 6.70686 5.7695 7.15232 5.67304 7.63727C5.57658 8.12223 5.62609 8.62489 5.8153 9.08171C6.00452 9.53852 6.32496 9.92897 6.73608 10.2037C7.1472 10.4784 7.63055 10.625 8.125 10.625C8.78804 10.625 9.42393 10.3616 9.89277 9.89277C10.3616 9.42393 10.625 8.78804 10.625 8.125ZM6.875 8.125C6.875 7.87777 6.94831 7.6361 7.08567 7.43054C7.22302 7.22498 7.41824 7.06476 7.64665 6.97015C7.87506 6.87554 8.12639 6.85079 8.36887 6.89902C8.61134 6.94725 8.83407 7.0663 9.00889 7.24112C9.1837 7.41593 9.30275 7.63866 9.35099 7.88114C9.39922 8.12361 9.37446 8.37495 9.27985 8.60335C9.18524 8.83176 9.02503 9.02699 8.81947 9.16434C8.6139 9.30169 8.37223 9.375 8.125 9.375C7.79348 9.375 7.47554 9.2433 7.24112 9.00888C7.0067 8.77446 6.875 8.45652 6.875 8.125Z"
                fill="#495470" />
                </svg>
          </span>
          ${song.album_title} - ${song.release_year}
        </p>
      </div>

        <button class="list__favorite icon-2 ${
          isFav ? "is-favorite" : ""
        }" data-id="${song.song_id}">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none"> <path d="M10 18.35L8.55 17.05C6.86667 15.5333 5.475 14.225 4.375 13.125C3.275 12.025 2.4 11.0417 1.75 10.175C1.1 9.29167 0.641667 8.48333 0.375 7.75C0.125 7.01667 0 6.26667 0 5.5C0 3.93333 0.525 2.625 1.575 1.575C2.625 0.525 3.93333 0 5.5 0C6.36667 0 7.19167 0.183333 7.975 0.55C8.75833 0.916667 9.43333 1.43333 10 2.1C10.5667 1.43333 11.2417 0.916667 12.025 0.55C12.8083 0.183333 13.6333 0 14.5 0C16.0667 0 17.375 0.525 18.425 1.575C19.475 2.625 20 3.93333 20 5.5C20 6.26667 19.8667 7.01667 19.6 7.75C19.35 8.48333 18.9 9.29167 18.25 10.175C17.6 11.0417 16.725 12.025 15.625 13.125C14.525 14.225 13.1333 15.5333 11.45 17.05L10 18.35ZM10 15.65C11.6 14.2167 12.9167 12.9917 13.95 11.975C14.9833 10.9417 15.8 10.05 16.4 9.3C17 8.53333 17.4167 7.85834 17.65 7.275C17.8833 6.675 18 6.08333 18 5.5C18 4.5 17.6667 3.66667 17 3C16.3333 2.33333 15.5 2 14.5 2C13.7167 2 12.9917 2.225 12.325 2.675C11.6583 3.10833 11.2 3.66667 10.95 4.35H9.05C8.8 3.66667 8.34167 3.10833 7.675 2.675C7.00833 2.225 6.28333 2 5.5 2C4.5 2 3.66667 2.33333 3 3C2.33333 3.66667 2 4.5 2 5.5C2 6.08333 2.11667 6.675 2.35 7.275C2.58333 7.85834 3 8.53333 3.6 9.3C4.2 10.05 5.01667 10.9417 6.05 11.975C7.08333 12.9917 8.4 14.2167 10 15.65Z" fill="black" /></svg>
      </button>
    </article>
          `;
        });
        list.innerHTML = html;
      };

      renderSongs(top100, "top"); // Show "Top 100" on default
      tabTop.addEventListener("click", () => renderSongs(top100, "top"));
      tabExit.addEventListener("click", () => renderSongs(exits, "exit"));
      tabNew.addEventListener("click", () => renderSongs(newIn, "new"));

      // Favorites
      const getFavorites = () => JSON.parse(localStorage.getItem("favorites")); // Get favorites from localStorage
      const setFavorites = (array) =>
        localStorage.setItem("favorites", JSON.stringify(array)); // Set favorites in array and save in localStorage
      list.addEventListener("click", (element) => {
        const btn = element.target.closest(".list__favorite");
        if (!btn) return;

        const id = Number(btn.dataset.id); // Convert string to number
        let favorites = getFavorites(); // Get list of favorites

        // If song is already in favorites
        if (favorites.includes(id)) {
          favorites = favorites.filter((element) => element !== id); // Remove favorite song from array
          btn.classList.remove("is-favorite"); // Remove yellow background
        } else {
          // Else add favorite song
          favorites.push(id);
          btn.classList.add("is-favorite"); // Add yellow background
        }
        setFavorites(favorites);
      });
    } catch (err) {
      console.error("Fetching data failed:", err);
    }
  };

  loadTabs();
})();
