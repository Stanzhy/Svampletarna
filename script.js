const startsida = document.getElementById("startsida");
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
let currentPage = "startsida";
let currentUser;

// Konstruktor för användare med skydd mot ändringar (fryser objektet)
function User(newName, newPassword) {
  this.name = newName;
  this.password = newPassword;
  Object.freeze(this);
}

// Skapar nya användare och plasera i användarlistan
function newUser(currentName, currentPass) {
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
  localStorage.removeItem("user");
  currentUser = null;
  message.textContent = `Du har loggat ut.`;
  logInBtn.textContent = "Logga in";
}

function logIn() {
  let name = logInForm.elements.name.value;
  let password = logInForm.elements.password.value;

  // Söker användaren i listan och sparar namnet efter matchning
  users.forEach((element) => {
    if (element.name === name && element.password === password) {
      localStorage.setItem("user", element.name);
    }
  });

  // Kontrollerar om inloggningen lyckades
  if (!isLoggedIn()) {
    formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }

  hideLogInWindows();
}

// Kontrollerar om det är redan inloggat
function isLoggedIn() {
  currentUser = localStorage.getItem("user");
  if (currentUser) {
    message.textContent = `Välkommen ${currentUser}, du är nu inloggad.`;
    logInBtn.textContent = "Logga ut";
    return true;
  }
  return false;
}

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
function createSvampKort(svamp, container) {
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

  if (main) {
    const btn = createElement("button", "Jag har hittat denna svamp!");
    btn.addEventListener("click", () => {
      sparaFynd(svamp);
    });
    div.appendChild(btn);
  }

  container.appendChild(section);
}

// Skapar en element för varje särskiljande egenskap och lägger till den i rätt container. Tar emot egenskap objektet och container elementet som argument.
function createEgenskaper(egenskap, container) {
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

  container.appendChild(section);
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
      case "startsida":
        dataSvampar.svampar.forEach((svamp) => {
          createSvampKort(svamp, main);
        });
        break;
      //skapar artilel för varje särskiljande egenskap i speciellaegenskaper.json
      case "riskerOchEgenskaper":
        dataEgenskaper.särskiljande_egenskaper.forEach((egenskap) => {
          createEgenskaper(egenskap, main);
        });
        break;
      case "hittadeSvampar":

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
  isLoggedIn();
  fetchData();

  startsida.addEventListener("click", function () {
    currentPage = "startsida";
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
