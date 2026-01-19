(() => {
  const splash = document.getElementById("splash");
  if (!splash) {
    console.warn(`Loading screen: element with id "splash" was not found`);
    return;
  }

  const KEY = "firstVisit"; // Define user's first visit
  const hasVisited = localStorage.getItem(KEY) === "true"; // Look if the user has already visited

  // Hide loading state screen
  const hideSplash = () => {
    splash.remove();
  };

  // Hide splash if the user already has visited the page
  if (hasVisited) {
    hideSplash();
    return;
  }

  // Store user's first visit
  localStorage.setItem(KEY, "true");

  window.addEventListener("load", () => {
    setTimeout(hideSplash, 1000); // Test timer on first visit
  });
})();
