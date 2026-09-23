let logInWindow;
let logInBtn;
let overlay;
let closeBtn;
let logInForm;
let message;
const users = [];
let currentUser;

function User(newName, newPassword) {
  this.name = newName;
  this.password = newPassword;
  Object.freeze(this);
}

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
}

function logOut() {
  localStorage.removeItem("user");
  message.textContent = `Du har loggat ut.`;
  logInBtn.textContent = "Logga in";
}

function logIn() {
  let name = logInForm.elements.name.value;
  let password = logInForm.elements.password.value;
  let formsMessage = logInForm.querySelector("span");
  users.forEach((element) => {
    if (element.name == name && element.password == password) {
      localStorage.setItem("user", element.name);
    }
  });
  if (!isLoggedIn()) {
    formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }
  hideLogInWindows();
}

function isLoggedIn() {
  currentUser = localStorage.getItem("user" || null);
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
  newUser("Kalle", "qwe123");
  newUser("Kal", "123");

  isLoggedIn();

  logInBtn.addEventListener("click", function () {
    isLoggedIn() ? logOut() : showLogInWindows();
  });
  closeBtn.addEventListener("click", function () {
    hideLogInWindows();
  });

  logInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    logIn();
  });
}

window.onload = init;
