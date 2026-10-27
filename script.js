const DOM = {
  mainContainer: document.getElementById("mainContainer"),
  message: document.getElementById("message"),
  logInBtn: document.getElementById("logInBtn"),
  logInWindow: document.getElementById("logInWindow"),
  overlay: document.getElementById("overlay"),
  closeBtn: document.getElementById("closeBtn"),
  logInForm: document.getElementById("logInForm"),
  formsMessage: document.querySelector("#logInForm span"),
  mainPage: document.getElementById("mainPage"),
  mushroomsPage: document.getElementById("mushroomsPage"),
  foundPage: document.getElementById("foundPage"),
  risksPage: document.getElementById("risksPage"),
  createPostBtn: document.getElementById("createPostBtn"),
  createPostForm: document.getElementById("postForm"),
};

const state = {
  currentPage: "mainPage",
  currentUser: null,
  users: [],
  mushrooms: [],
  properties: [],
  posts: [],
};
// Konstruktor för användare med skydd mot ändringar (fryser objektet)
class User {
  #password;
  constructor(newName, newPassword, isRedaktor = false) {
    this.name = newName;
    this.#password = newPassword;
    this.foundMushrooms = [];
    this.isLoggedIn = false;
    this.isRedaktor = isRedaktor;
  }

  checkPassword(currentPassword) {
    return this.#password === currentPassword;
  }

  addFoundMushroom(mushroom) {
    if (
      !this.foundMushrooms.some((m) => m.svenskt_namn === mushroom.svenskt_namn)
    ) {
      this.foundMushrooms.push(mushroom);
    }
  }

  deleteMushroom(mushroom) {
    const index = this.foundMushrooms.indexOf(mushroom);
    this.foundMushrooms.splice(index, 1);
  }
}

// Skapar nya användare och plasera i användarlistan
function createUser(currentName, currentPass, isRedaktor = false) {
  if (state.users.some((user) => user.name === currentName)) {
    console.log(`Användaren ${currentName} finns redan.`);
    return;
  }
  state.users.push(new User(currentName, currentPass, isRedaktor));
}

function showLogInWindows() {
  overlay.hidden = false;
  logInWindow.hidden = false;
  DOM.message.textContent = "";
}

function hideLogInWindows() {
  overlay.hidden = true;
  logInWindow.hidden = true;
  logInForm.reset();
  DOM.formsMessage.textContent = "";
}

function logOut() {
  if (state.currentUser) {
    state.currentUser.isLoggedIn = false;
    state.currentUser = null;
    StorageService.saveUsers();
    updateUI();
  }
  DOM.message.textContent = `Du har loggat ut.`;
  DOM.logInBtn.textContent = "Logga in";
}

function logIn() {
  const name = DOM.logInForm.elements.name.value;
  const password = DOM.logInForm.elements.password.value;

  const user = state.users.find((u) => u.name === name);
  // Söker användaren i listan och sparar namnet efter matchning

  if (user && user.checkPassword(password)) {
    user.isLoggedIn = true;
    StorageService.saveUsers();
    hideLogInWindows();
    updateUI();
  }

  // Kontrollerar om inloggningen lyckades
  if (!isLoggedIn()) {
    DOM.formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }
}

// Kontrollerar om det är redan inloggat
function isLoggedIn() {
  state.currentUser = state.users.find((u) => u.isLoggedIn) || null;
  if (state.currentUser) {
    DOM.message.textContent = `Välkommen ${state.currentUser.name}, du är nu inloggad.`;
    DOM.logInBtn.textContent = "Logga ut";
    return true;
  }
  DOM.logInBtn.textContent = "Logga in";
  return false;
}

const StorageService = {
  saveUsers() {
    const dataToSave = state.users.map((u) => ({
      name: u.name,
      foundMushrooms: u.foundMushrooms,
      isLoggedIn: u.isLoggedIn,
      isRedaktor: u.isRedaktor,
    }));
    localStorage.setItem("users", JSON.stringify(dataToSave));
  },

  loadUsersData() {
    const data = localStorage.getItem("users");
    const parsedUsers = data ? JSON.parse(data) : [];

    if (parsedUsers.length > 0) {
      try {
        parsedUsers.forEach((userData) => {
          const updatedUser = state.users.find((u) => u.name === userData.name);
          if (updatedUser) {
            updatedUser.foundMushrooms = userData.foundMushrooms || [];
            updatedUser.isLoggedIn = userData.isLoggedIn || false;
            updatedUser.isRedaktor = userData.isRedaktor || false;
          }
        });
      } catch (error) {
        console.error("Fel vid bearbetning av sparade användare:", error);
      }
    }
  },
};

function createElement(tag, textContent = "") {
  const element = document.createElement(tag);
  element.textContent = textContent;
  return element;
}

// Skapar ett img element med src och alt attribut.
function createImageElement(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  return img;
}

function findMushroomByName(partialName) {
  return state.mushrooms.find((s) => s.svenskt_namn.includes(partialName));
}

// Skapar ett svampkort med information om svampen och lägger till den i rätt container. Tar emot svamp objektet och container elementet som argument.
function createSvampKort(svamp, btnText, btnAction) {
  const section = document.createElement("section");
  section.classList.add("svamp-card");

  const img = createImageElement(`./img/${svamp.bild}`, svamp.svenskt_namn);
  section.appendChild(img);

  const div = createElement("div");
  section.appendChild(div);

  div.appendChild(createElement("h3", svamp.svenskt_namn));
  div.appendChild(createElement("p", `Latinskt namn: ${svamp.latinskt_namn}`));
  div.appendChild(createElement("p", `Ätlighet: ${svamp.ätlig}`));
  div.appendChild(createElement("p", `Beskrivning: ${svamp.beskrivning}`));
  div.appendChild(createElement("p", `Fyndplats: ${svamp.fyndplats}`));

  if (btnText && btnAction) {
    const btn = createElement("button", btnText);
    btn.addEventListener("click", () => btnAction(btn));
    div.appendChild(btn);
  }

  return section;
}

function renderRisksPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  state.properties.forEach((egenskap) => {
    const section = createElement("section");

    const name1 = egenskap.par.slice(0, 6);
    const mushroom1 = findMushroomByName(name1);
    if (mushroom1) {
      section.appendChild(
        createImageElement(`./img/${mushroom1.bild}`, mushroom1.svenskt_namn),
      );
    }

    const name2 = egenskap.par.split("vs. ")[1].slice(0, 6);
    const mushroom2 = name2 ? findMushroomByName(name2) : null;
    if (mushroom2) {
      section.appendChild(
        createImageElement(`./img/${mushroom2.bild}`, mushroom2.svenskt_namn),
      );
    }

    const div = createElement("div");
    section.appendChild(div);

    div.appendChild(createElement("h3", egenskap.par));
    div.appendChild(createElement("p", `Risk: ${egenskap.risk}`));
    div.appendChild(createElement("h4", "Särskiljande:"));

    const ul = createElement("ul");
    egenskap.särskiljande.forEach((item) => {
      ul.appendChild(createElement("li", item));
    });
    div.appendChild(ul);

    DOM.mainContainer.appendChild(section);
  });
}

function renderMushroomsPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  state.mushrooms.forEach((svamp) => {
    const card = createSvampKort(
      svamp,
      "Jag har hittat denna svamp!",
      (btn) => {
        if (isLoggedIn()) {
          state.currentUser.addFoundMushroom(svamp);
          StorageService.saveUsers();
          btn.textContent = "Svamp är hittad ✓";
        } else {
          DOM.message.textContent =
            "Du måste logga in för att lägga till svampar.";
        }
      },
    );
    DOM.mainContainer.appendChild(card);
  });
}

function renderFoundPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  if (!isLoggedIn()) {
    const message = createElement(
      "h3",
      "Du måste logga in för att se dina svampar.",
    );
    DOM.mainContainer.appendChild(message);
    return;
  }

  if (state.currentUser.foundMushrooms.length === 0) {
    const message = createElement("h3", "Du har inga hittade svampar.");
    DOM.mainContainer.appendChild(message);
    return;
  }

  state.currentUser.foundMushrooms.forEach((svamp) => {
    const card = createSvampKort(svamp, "Ta bort svampen", () => {
      state.currentUser.deleteMushroom(svamp);
      StorageService.saveUsers();
      updateUI();
    });
    DOM.mainContainer.appendChild(card);
  });

  const clearContainer = createElement("div");
  clearContainer.classList.add("clear-btn-cont");

  const clearBtn = createElement("button", "Rensa listan");
  clearBtn.addEventListener("click", () => {
    state.currentUser.foundMushrooms = [];
    StorageService.saveUsers();
    updateUI();
  });
  clearContainer.appendChild(clearBtn);
  DOM.mainContainer.appendChild(clearContainer);
}

function updateUI() {
  switch (state.currentPage) {
    case "mainPage":
      renderMainPage();
      break;

    case "mushroomsPage":
      renderMushroomsPage();
      break;

    case "foundPage":
      renderFoundPage();
      break;

    case "risksPage":
      renderRisksPage();
      break;
  }
}

async function fetchData() {
  try {
    const responceSvampar = await fetch("./svampar.json");
    const responceEgenskaper = await fetch("./speciellaegenskaper.json");

    if (!responceSvampar.ok || !responceEgenskaper.ok) {
      throw new Error("Fetch is failed!");
    }

    const dataSvampar = await responceSvampar.json();
    const dataEgenskaper = await responceEgenskaper.json();

    state.mushrooms.push(...dataSvampar.svampar);
    state.properties.push(...dataEgenskaper.särskiljande_egenskaper);

    updateUI();
  } catch (error) {
    console.error(error);
  }
}

function init() {
  // Skapar nya användare
  createUser("Kalle", "qwe123", (isRedaktor = true));
  createUser("Anna", "asd123");

  // När sidan laddas kollar om det är redan inloggat
  StorageService.loadUsersData(state.users);
  isLoggedIn();
  fetchData();

  DOM.mainPage.addEventListener("click", function () {
    state.currentPage = "mainPage";
    updateUI();
  });

  DOM.mushroomsPage.addEventListener("click", function () {
    state.currentPage = "mushroomsPage";
    updateUI();
  });

  DOM.foundPage.addEventListener("click", function () {
    state.currentPage = "foundPage";
    updateUI();
  });

  DOM.risksPage.addEventListener("click", function () {
    state.currentPage = "risksPage";
    updateUI();
  });

  DOM.logInBtn.addEventListener("click", function (event) {
    event.preventDefault();
    if (isLoggedIn()) {
      logOut();
    } else showLogInWindows();
  });

  DOM.closeBtn.addEventListener("click", function () {
    hideLogInWindows();
  });

  DOM.overlay.addEventListener("click", function () {
    hideLogInWindows();
  });

  DOM.logInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    logIn();
    updateUI();
  });
}

window.onload = init;
