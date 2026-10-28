// --- DOM-ELEMENT ---
// Samling av referenser till HTML-element som används i applikationen
const DOM = {
  logoLink: document.getElementById("logoLink"),
  mainContainer: document.getElementById("mainContainer"),
  message: document.getElementById("message"),
  logInBtn: document.getElementById("logInBtn"),
  createNewUserBtn: document.getElementById("createNewUserBtn"),
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

// --- APPLIKATIONENS STATE ---
// Håller reda på aktuell sida, inloggad användare samt datalistor
const state = {
  currentPage: "mainPage",
  currentUser: null,
  users: [],
  mushrooms: [],
  properties: [],
  posts: [],
};

// --- ANVÄNDARKLASS ---
// Konstruktor för användare med inkapslat (privat) lösenord
class User {
  #password;
  constructor(newName, newPassword, isRedaktor = false) {
    this.name = newName;
    this.#password = newPassword;
    this.foundMushrooms = [];
    this.isLoggedIn = false;
    this.isRedaktor = isRedaktor;
  }

  // Verifierar angivet lösenord mot det sparade lösenordet
  checkPassword(currentPassword) {
    return this.#password === currentPassword;
  }

  // Lägger till en svamp i listan över hittade svampar om den inte redan finns
  addFoundMushroom(mushroom) {
    if (
      !this.foundMushrooms.some((m) => m.svenskt_namn === mushroom.svenskt_namn)
    ) {
      this.foundMushrooms.push(mushroom);
    }
  }

  // Raderar en specifik svamp från användarens hittade lista
  deleteMushroom(mushroom) {
    const index = this.foundMushrooms.indexOf(mushroom);
    this.foundMushrooms.splice(index, 1);
  }
}

// --- ANVÄNDARHANTERING ---
// Skapar en ny användare och sparar den i användarlistan om namnet är unikt
function createUser(currentName, currentPass, isRedaktor = false) {
  if (state.users.some((user) => user.name === currentName)) {
    DOM.formsMessage.textContent = `Användaren ${currentName} finns redan.`;
    return;
  }
  state.users.push(new User(currentName, currentPass, isRedaktor));
  StorageService.saveUsers(state.users);
  DOM.formsMessage.textContent = `Användaren ${currentName} har skapats.`;
}

// --- INLOGGNING OCH AUTENTISERING ---
// Visar inloggningsfönstret och bakgrundsöverdraget
function showLogInWindows() {
  overlay.hidden = false;
  logInWindow.hidden = false;
  DOM.message.textContent = "";
  DOM.formsMessage.textContent = "";
}

// Döljer inloggningsfönstret och återställer formulärfält
function hideLogInWindows() {
  overlay.hidden = true;
  logInWindow.hidden = true;
  logInForm.reset();
  DOM.formsMessage.textContent = "";
}

// Loggar ut aktiv användare, sparar ändrat tillstånd och uppdaterar vyn
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

// Validerar inloggningsuppgifter och sätter inloggad status
function logIn() {
  const name = DOM.logInForm.elements.name.value;
  const password = DOM.logInForm.elements.password.value;

  const user = state.users.find((u) => u.name === name);

  if (user && user.checkPassword(password)) {
    user.isLoggedIn = true;
    StorageService.saveUsers();
    hideLogInWindows();
    updateUI();
  }

  if (!isLoggedIn()) {
    DOM.formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }
}

// Kontrollerar om en användare är inloggad och anpassar gränssnittet
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

// --- LAGRINGSTJÄNST FÖR ANVÄNDARE ---
// Hanterar sparande och inläsning av användare i localStorage
const StorageService = {
  // Sparar användarlistan som en JSON-sträng i localStorage
  saveUsers() {
    const dataToSave = state.users.map((u) => ({
      name: u.name,
      foundMushrooms: u.foundMushrooms,
      isLoggedIn: u.isLoggedIn,
      isRedaktor: u.isRedaktor,
    }));
    localStorage.setItem("users", JSON.stringify(dataToSave));
  },

  // Läser in sparade användare och uppdaterar matchande användarobjekt
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

// --- DOM-HJÄLPFUNKTIONER ---
// Skapar ett element med angiven tagg och textinnehåll
function createElement(tag, textContent = "") {
  const element = document.createElement(tag);
  element.textContent = textContent;
  return element;
}

// Skapar ett img-element med sökväg och alt-attribut
function createImageElement(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  return img;
}

// Söker efter en svamp i svamplistan baserat på delnamn
function findMushroomByName(partialName) {
  return state.mushrooms.find((s) => s.svenskt_namn.includes(partialName));
}

// Skapar ett kort för en svamp med bild, information och knapp
function createMushroomCart(mushroom, btnText, btnAction) {
  const section = document.createElement("section");

  const img = createImageElement(
    `./img/${mushroom.bild}`,
    mushroom.svenskt_namn,
  );
  section.appendChild(img);

  const div = createElement("div");
  section.appendChild(div);

  div.appendChild(
    createElement("h3", `${mushroom.svenskt_namn} (${mushroom.latinskt_namn})`),
  );
  div.appendChild(createElement("p", `Ätlighet: ${mushroom.ätlig}`));
  div.appendChild(createElement("p", `Beskrivning: ${mushroom.beskrivning}`));
  div.appendChild(createElement("p", `Fyndplats: ${mushroom.fyndplats}`));

  if (btnText && btnAction) {
    const btn = createElement("button", btnText);
    btn.addEventListener("click", () => btnAction(btn));
    div.appendChild(btn);
  }

  return section;
}

// --- SIDRENDERINGAR ---
// Bygger upp sidan för risker och egenskaper
function renderRisksPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  state.properties.forEach((property) => {
    const section = createElement("section");

    const name1 = property.par.slice(0, 6);
    const mushroom1 = findMushroomByName(name1);
    if (mushroom1) {
      section.appendChild(
        createImageElement(`./img/${mushroom1.bild}`, mushroom1.svenskt_namn),
      );
    }

    const name2 = property.par.split("vs. ")[1].slice(0, 6);
    const mushroom2 = name2 ? findMushroomByName(name2) : null;
    if (mushroom2) {
      section.appendChild(
        createImageElement(`./img/${mushroom2.bild}`, mushroom2.svenskt_namn),
      );
    }

    const div = createElement("div");
    section.appendChild(div);

    div.appendChild(createElement("h3", property.par));
    div.appendChild(createElement("p", `Risk: ${property.risk}`));
    div.appendChild(createElement("h4", "Särskiljande:"));

    const ul = createElement("ul");
    property.särskiljande.forEach((item) => {
      ul.appendChild(createElement("li", item));
    });
    div.appendChild(ul);

    DOM.mainContainer.appendChild(section);
  });
}

// Bygger upp sidan med alla svampar och knappar för att spara fynd
function renderMushroomsPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  state.mushrooms.forEach((mushroom) => {
    const card = createMushroomCart(
      mushroom,
      "Jag har hittat denna svamp!",
      (btn) => {
        if (isLoggedIn()) {
          state.currentUser.addFoundMushroom(mushroom);
          StorageService.saveUsers();
          btn.textContent = "Svamp är hittad ✓";
        } else {
          btn.textContent = "Logga in för att lägga till svampar.";
        }
      },
    );
    DOM.mainContainer.appendChild(card);
  });
}

// Bygger upp sidan med inloggad användares hittade svampar samt rensningsknapp
function renderFoundPage() {
  DOM.mainContainer.innerHTML = "";
  DOM.createPostBtn.hidden = true;
  DOM.createPostForm.hidden = true;

  if (!isLoggedIn()) {
    const message = createElement("h3", "Logga in för att se dina svampar.");
    DOM.mainContainer.appendChild(message);
    return;
  }

  if (state.currentUser.foundMushrooms.length === 0) {
    const message = createElement("h3", "Du har inga hittade svampar.");
    DOM.mainContainer.appendChild(message);
    return;
  }

  state.currentUser.foundMushrooms.forEach((svamp) => {
    const card = createMushroomCart(svamp, "Ta bort svampen", () => {
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

// Markerar den aktiva länken i navigeringsmenyn med CSS-klass
function showColorCurrentPage(currentPage) {
  DOM.mainPage.classList.remove("selectedPage");
  DOM.mushroomsPage.classList.remove("selectedPage");
  DOM.foundPage.classList.remove("selectedPage");
  DOM.risksPage.classList.remove("selectedPage");
  DOM[currentPage].classList.add("selectedPage");
}

// Styr renderingen baserat på applikationens aktuella sida
function updateUI() {
  showColorCurrentPage(state.currentPage);
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

// --- ASYNKRON DATAHÄMTNING ---
// Hämtar data från lokala JSON-filer och sparar i applikationstillståndet
async function fetchData() {
  try {
    const responceSvampar = await fetch("./svampar.json");
    const responceEgenskaper = await fetch("./speciellaEgenskaper.json");

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

// --- STARTPUNKT ---
// Initierar grundanvändare, läser in sparad data och kopplar händelselyssnare
function init() {
  // Skapar standardanvändare
  createUser("Kalle", "qwe123", true);
  createUser("Anna", "asd123");

  // Kontrollerar tidigare session och laddar data
  StorageService.loadUsersData(state.users);
  isLoggedIn();
  state.posts = BlogStorage.loadPosts();
  updateUI(); // Renderar bloggen direkt utan fördröjning
  fetchData(); // Hämtar svampdata i bakgrunden

  // Klick på logotypen navigerar till startsidan
  DOM.logoLink.addEventListener("click", function (e) {
    e.preventDefault();
    state.currentPage = "mainPage";
    updateUI();
  });

  // Händelselyssnare för sidnavigering
  DOM.mainPage.addEventListener("click", function (e) {
    e.preventDefault();
    state.currentPage = "mainPage";
    updateUI();
  });

  DOM.mushroomsPage.addEventListener("click", function (e) {
    e.preventDefault();
    state.currentPage = "mushroomsPage";
    updateUI();
  });

  DOM.foundPage.addEventListener("click", function (e) {
    e.preventDefault();
    state.currentPage = "foundPage";
    updateUI();
  });

  DOM.risksPage.addEventListener("click", function (e) {
    e.preventDefault();
    state.currentPage = "risksPage";
    updateUI();
  });

  // Händelselyssnare för inloggning och modalhantering
  DOM.logInBtn.addEventListener("click", function (e) {
    e.preventDefault();
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

  DOM.logInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    logIn();
    updateUI();
  });

  // Händelselyssnare för att registrera en ny användare med validering
  DOM.createNewUserBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const name = DOM.logInForm.elements.name.value.trim();
    const password = DOM.logInForm.elements.password.value.trim();
    if (!name || !password) {
      DOM.formsMessage.textContent = "Fyll i både namn och lösenord.";
      return;
    }
    createUser(name, password, false);
  });
}

window.onload = init;
