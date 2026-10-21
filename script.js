const mushroomsPage = document.getElementById("mushroomsPage");
const hittadeSvampar = document.getElementById("hittadeSvampar");
const riskerOchEgenskaper = document.getElementById("riskerOchEgenskaper");
const logInWindow = document.getElementById("logInWindow");
const logInBtn = document.getElementById("logInBtn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const logInForm = document.querySelector("form");
const message = document.getElementById("message");
const formsMessage = logInForm.querySelector("span");
const main = document.querySelector("main");
const users = [];
let currentPage = "mainPage";
let currentUser;

// Konstruktor för användare med skydd mot ändringar (fryser objektet)
class User {
  #password = "";
  constructor(newName, newPassword) {
    this.name = newName;
    this.#password = newPassword;
    this.foundMushrooms = [];
    this.isLoggedIn = false;
  }

  checkPassword(currentPassword) {
    return this.#password === currentPassword;
  }

  addFoundMushroom(mushroom) {
    if (!this.foundMushrooms.includes(mushroom)) {
      this.foundMushrooms.push(mushroom);
    }
  }
}

// Skapar nya användare och plasera i användarlistan
function newUser(currentName, currentPass) {
  if (users.some((user) => user.name === currentName)) {
    console.log(`Användaren ${currentName} finns redan.`);
    return;
  }
  const user = new User(currentName, currentPass);
  users.push(user);
}

function showLogInWindows() {
  overlay.hidden = false;
  logInWindow.hidden = false;
  message.textContent = "";
}

function hideLogInWindows() {
  overlay.hidden = true;
  logInWindow.hidden = true;
  logInForm.reset();
  formsMessage.textContent = "";
}

function logOut() {
  if (currentUser) {
    currentUser.isLoggedIn = false;
    currentUser = null;
    saveCurrentUsersData();
  }
  message.textContent = `Du har loggat ut.`;
  logInBtn.textContent = "Logga in";
}

function logIn() {
  const name = logInForm.elements.name.value;
  const password = logInForm.elements.password.value;

  const user = users.find((u) => u.name === name);
  // Söker användaren i listan och sparar namnet efter matchning

  if (user && user.checkPassword(password)) {
    user.isLoggedIn = true;
    saveCurrentUsersData(user);
    hideLogInWindows();
  }

  // Kontrollerar om inloggningen lyckades
  if (!isLoggedIn()) {
    formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }
}

function saveCurrentUsersData() {
  const usersDataToSave = [];
  users.forEach((user) => {
    usersDataToSave.push({
      name: user.name,
      foundMushrooms: user.foundMushrooms,
      isLoggedIn: user.isLoggedIn,
    });
  });
  localStorage.setItem("users", JSON.stringify(usersDataToSave));
}

function getDataFromLocalStorage() {
  const storedUsers = localStorage.getItem("users");
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers);
      parsedUsers.forEach((userData) => {
        const updatedUser = users.find((u) => u.name === userData.name);
        if (updatedUser) {
          updatedUser.foundMushrooms = userData.foundMushrooms || [];
          updatedUser.isLoggedIn = userData.isLoggedIn || false;
        }
      });
      console.log("Användare hämtade från localStorage:", users);
    } catch (error) {
      console.error("Fel vid läsning från localStorage:", error);
    }
  }
}

// Kontrollerar om det är redan inloggat
function isLoggedIn() {
  currentUser = users.find((u) => u.isLoggedIn) || null;
  if (currentUser) {
    console.log("Inloggad användare:", currentUser);
    message.textContent = `Välkommen ${currentUser.name}, du är nu inloggad.`;
    logInBtn.textContent = "Logga ut";
    return true;
  }
  logInBtn.textContent = "Logga in";
  return false;
}

// visaFoundMushrooms() {}

function createElement(tag, textContent) {
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

// Skapar ett svampkort med information om svampen och lägger till den i rätt container. Tar emot svamp objektet och container elementet som argument.
function createSvampKort(svamp) {
  const section = document.createElement("section");
  section.classList.add("svamp-card");

  const img = createImageElement(`./img/${svamp.bild}`, svamp.svenskt_namn);
  section.appendChild(img);

  const div = createElement("div");
  section.appendChild(div);

  const namn = createElement("h3", svamp.svenskt_namn);
  div.appendChild(namn);

  const latinsktNamn = createElement(
    "p",
    `Latinskt namn: ${svamp.latinskt_namn}`,
  );
  div.appendChild(latinsktNamn);

  const ätlig = createElement("p", `Ätlighet: ${svamp.ätlig}`);
  div.appendChild(ätlig);

  const beskrivning = createElement("p", `Beskrivning: ${svamp.beskrivning}`);
  div.appendChild(beskrivning);

  const fyndPlats = createElement("p", `Fyndplats: ${svamp.fyndplats}`);
  div.appendChild(fyndPlats);

  if (currentPage === "mushroomsPage") {
    const btn = createElement("button", "Jag har hittat denna svamp!");
    btn.addEventListener("click", () => {
      if (currentUser) {
        currentUser.addFoundMushroom(svamp);
        saveCurrentUsersData(currentUser);
      } else {
        message.textContent = "Du måste logga in för att lägga till svampar.";
      }
    });
    div.appendChild(btn);
  }

  main.appendChild(section);
}

// Skapar en element för varje särskiljande egenskap och lägger till den i rätt container. Tar emot egenskap objektet och container elementet som argument.
function createEgenskaper(egenskap) {
  const section = document.createElement("section");

  const div = createElement("div");
  section.appendChild(div);

  const par = createElement("h3", egenskap.par);
  div.appendChild(par);

  const risk = createElement("p", `Risk: ${egenskap.risk}`);
  div.appendChild(risk);

  const särskiljande = createElement("h4", `Särskiljande:`);
  div.appendChild(särskiljande);

  const särskiljandeList = document.createElement("ul");
  egenskap.särskiljande.forEach((skillnad) => {
    const li = createElement("li", skillnad);
    särskiljandeList.appendChild(li);
  });
  div.appendChild(särskiljandeList);

  main.appendChild(section);
}

async function fetchData() {
  try {
    const responceSvampar = await fetch("./svampar.json");
    const responceEgenskaper = await fetch("./speciellaegenskaper.json");

    if (!responceSvampar.ok) {
      throw new Error("Fetch svampar is failed!");
    }

    if (!responceEgenskaper.ok) {
      throw new Error("Fetch egenskaper is failed!");
    }

    const dataSvampar = await responceSvampar.json();
    const dataEgenskaper = await responceEgenskaper.json();

    switch (currentPage) {
      case "mushroomsPage":
        dataSvampar.svampar.forEach((svamp) => {
          createSvampKort(svamp);
        });
        break;

      case "hittadeSvampar":
        if (currentUser) {
          console.log("Hittade svampar för användare:", currentUser);
          currentUser.foundMushrooms.forEach((svamp) => {
            createSvampKort(svamp);
          });
        }
        break;
      //skapar artilel för varje särskiljande egenskap i speciellaegenskaper.json
      case "riskerOchEgenskaper":
        dataEgenskaper.särskiljande_egenskaper.forEach((egenskap) => {
          createEgenskaper(egenskap);
        });
        break;
    }
  } catch (error) {
    console.error(error);
  }
}

function init() {
  // Skapar nya användare
  newUser("Kalle", "qwe123");
  newUser("Anna", "asd123");

  // När sidan laddas kollar om det är redan inloggat
  getDataFromLocalStorage();
  isLoggedIn();
  fetchData();

  mushroomsPage.addEventListener("click", function () {
    currentPage = "mushroomsPage";
    main.innerHTML = "";
    fetchData();
  });

  hittadeSvampar.addEventListener("click", function () {
    currentPage = "hittadeSvampar";
    main.innerHTML = "";
    fetchData();
  });

  riskerOchEgenskaper.addEventListener("click", function () {
    currentPage = "riskerOchEgenskaper";
    main.innerHTML = "";
    fetchData();
  });

  logInBtn.addEventListener("click", function (event) {
    event.preventDefault();
    isLoggedIn() ? logOut() : showLogInWindows();
  });

  closeBtn.addEventListener("click", function () {
    hideLogInWindows();
  });

  overlay.addEventListener("click", function () {
    hideLogInWindows();
  });

  logInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    logIn();
  });
}

window.onload = init;
