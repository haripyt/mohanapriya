document.addEventListener("DOMContentLoaded", function () {

const savedTheme = localStorage.getItem("themeMode");
const savedColor = localStorage.getItem("accentColor");

/* APPLY THEME */

if(savedTheme === "dark"){
document.body.classList.add("dark");
}else{
document.body.classList.remove("dark");
}

/* APPLY ACCENT COLOR */

if(savedColor){
document.documentElement.style.setProperty("--primary", savedColor);
}

});