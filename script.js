const mushroomsPage = document.getElementById("mushroomsPage");
const foundMushrooms = document.getElementById("foundMushrooms");
const risksProperties = document.getElementById("risksProperties");
const logInWindow = document.getElementById("logInWindow");
const logInBtn = document.getElementById("logInBtn");
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");
const logInForm = document.querySelector("form");
const message = document.getElementById("message");
const formsMessage = logInForm.querySelector("span");
const main = document.querySelector("main");
const allMushrooms = [];
const allProperties = [];
const users = [];
let currentPage = "mainPage";
let currentUser;

// Konstruktor för användare med skydd mot ändringar (fryser objektet)
class User {
  #password;
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

  deleteMushroom(mushroom) {
    const index = this.foundMushrooms.indexOf(mushroom);
    this.foundMushrooms.splice(index, 1);
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
    updateUI();
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
    updateUI();
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
    } catch (error) {
      console.error("Fel vid läsning från localStorage:", error);
    }
  }
}

// Kontrollerar om det är redan inloggat
function isLoggedIn() {
  currentUser = users.find((u) => u.isLoggedIn) || null;
  if (currentUser) {
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
        btn.textContent = "Svapm är hittad";
      } else {
        message.textContent = "Du måste logga in för att lägga till svampar.";
      }
    });
    div.appendChild(btn);
  }

  if (currentPage === "foundMushrooms") {
    const btn = createElement("button", "Tabort svampen");
    btn.addEventListener("click", () => {
      if (currentUser) {
        currentUser.deleteMushroom(svamp);
        saveCurrentUsersData(currentUser);
        updateUI();
      }
    });
    div.appendChild(btn);
  }

  main.appendChild(section);
}

function checkImg(mushroomName) {
  let mushroomImg;
  allMushrooms.forEach((svamp) => {
    if (svamp.svenskt_namn.includes(mushroomName)) {
      mushroomImg = svamp.bild;
    }
  });
  return mushroomImg;
}
// Skapar en element för varje särskiljande egenskap och lägger till den i rätt container. Tar emot egenskap objektet och container elementet som argument.
function createEgenskaper(egenskap, image) {
  const section = document.createElement("section");

  const imgPath1 = checkImg(egenskap.par.slice(0, 6));
  const img1 = createImageElement(`./img/${imgPath1}`, "");
  section.appendChild(img1);

  const imgPath2 = checkImg(egenskap.par.split("vs. ")[1].slice(0, 6));
  if (imgPath2) {
    const img2 = createImageElement(`./img/${imgPath2}`, "");
    section.appendChild(img2);
  }

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

function updateUI() {
  switch (currentPage) {
    case "mushroomsPage":
      //mushroomsPage.classList.add("selectedPage");
      main.innerHTML = "";
      allMushrooms.forEach((svamp) => {
        createSvampKort(svamp);
      });
      break;

    case "foundMushrooms":
      main.innerHTML = "";
      if (currentUser) {
        currentUser.foundMushrooms.forEach((svamp) => {
          createSvampKort(svamp);
        });
        const clearBtnCont = createElement("div", "");
        clearBtnCont.classList.add("clear-btn-cont");
        main.appendChild(clearBtnCont);

        const clearBtn = createElement("button", `Rensa listan`);
        clearBtn.addEventListener("click", () => {
          currentUser.foundMushrooms = [];
          saveCurrentUsersData(currentUser);
          updateUI();
        });
        clearBtnCont.appendChild(clearBtn);
      }
      break;
    //skapar artilel för varje särskiljande egenskap i speciellaegenskaper.json
    case "risksProperties":
      main.innerHTML = "";
      allProperties.forEach((egenskap) => {
        createEgenskaper(egenskap, checkImg(egenskap));
      });
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

    allMushrooms.push(...dataSvampar.svampar);
    allProperties.push(...dataEgenskaper.särskiljande_egenskaper);

    updateUI();
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
    updateUI();
  });

  foundMushrooms.addEventListener("click", function () {
    currentPage = "foundMushrooms";
    updateUI();
  });

  risksProperties.addEventListener("click", function () {
    currentPage = "risksProperties";
    updateUI();
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
    updateUI();
  });
}

window.onload = init;
