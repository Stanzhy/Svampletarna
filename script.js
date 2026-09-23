let logInWindow;
let logInBtn;
let overlay;
let closeBtn;
let logInForm;
let message;
let currentUser;
const userKalle = {
  name: "Kalle",
  password: "qwe123",
};
let users = [userKalle];

function showLogInWindows() {
  overlay.classList.remove("hidden");
  logInWindow.classList.remove("hidden");
  message.textContent = "";
}

function hideLogInWindows() {
  overlay.classList.add("hidden");
  logInWindow.classList.add("hidden");
}

function logUt() {
  currentUser = undefined;
  message.textContent = `Du har loggat ut.`;
  logInBtn.textContent = "Logga In";
}

function logIn() {
  let name = logInForm.elements.name.value;
  let password = logInForm.elements.password.value;
  let formsMessage = logInForm.querySelector("span");
  users.forEach((element) => {
    if (element.name == name && element.password == password) {
      currentUser = element;
    }
  });
  if (!currentUser) {
    formsMessage.textContent = "Felaktiga inloggningsuppgifter";
    return;
  }
  if (currentUser) {
    hideLogInWindows();
    message.textContent = `Välkommen ${currentUser.name}, du är nu inloggad.`;
    logInBtn.textContent = "Logga Ut";
    logInForm.reset();
  }
}

function init() {
  logInWindow = document.getElementById("logInWindow");
  logInBtn = document.getElementById("logInBtn");
  overlay = document.getElementById("overlay");
  closeBtn = document.getElementById("closeBtn");
  logInForm = document.querySelector("form");
  message = document.getElementById("message");

  
  logInBtn.addEventListener("click", function () {
    currentUser ? logUt() : showLogInWindows();
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
