let logInWindow;
let logInBtn;
let overlay;
let closeBtn;

function showLogInWindows() {
  overlay.classList.remove("hidden");
  logInWindow.classList.remove("hidden");
}

function hideLogInWindows() {
  overlay.classList.add("hidden");
  logInWindow.classList.add("hidden");
}

function init() {
  logInWindow = document.getElementById("logInWindow");
  logInBtn = document.getElementById("logInBtn");
  overlay = document.getElementById("overlay");
  closeBtn = document.getElementById("closeBtn");

  logInBtn.addEventListener("click", function () {
    showLogInWindows();
  });
  closeBtn.addEventListener("click", function () {
    hideLogInWindows();
  });
}

window.onload = init;
