let logInWindow;
let logInBtn;
let overlay;
let closeBtn;
let logInForm;
let message;
let formsMessage;
const users = [];
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
  overlay.classList.remove("hidden");
  logInWindow.classList.remove("hidden");
  message.textContent = "";
}

function hideLogInWindows() {
  overlay.classList.add("hidden");
  logInWindow.classList.add("hidden");
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
    if (element.name == name && element.password == password) {
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

function init() {
  logInWindow = document.getElementById("logInWindow");
  logInBtn = document.getElementById("logInBtn");
  overlay = document.getElementById("overlay");
  closeBtn = document.getElementById("closeBtn");
  logInForm = document.querySelector("form");
  message = document.getElementById("message");
  formsMessage = logInForm.querySelector("span");

  // Skapar nya användare
  newUser("Kalle", "qwe123");
  newUser("Anna", "asd123");

  // När sidan laddas kollar om det är redan inloggat
  isLoggedIn();

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
