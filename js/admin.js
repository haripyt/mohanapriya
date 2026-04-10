if(sessionStorage.getItem("isLoggedIn") !== "true"){
window.location.href="index.html"
}

let history = JSON.parse(localStorage.getItem("loginHistory")) || []

const table = document.getElementById("userTable")
const timeline = document.getElementById("timeline")

function render(){

table.innerHTML=""

history.forEach((u,i)=>{

table.innerHTML+=`
<tr>
<td>${u.name}</td>
<td>${u.email}</td>
<td>${u.password}</td>
<td>${u.time}</td>
<td>
<button class="btn-primary small" onclick="deleteUser(${i})">Delete</button>
</td>
</tr>
`

})

document.getElementById("totalLogins").textContent = history.length

const unique = [...new Set(history.map(u=>u.email))]

document.getElementById("uniqueUsers").textContent = unique.length

if(history.length>0){
document.getElementById("latestLogin").textContent = history[history.length-1].name
}

timeline.innerHTML=""

history.slice(-5).reverse().forEach(u=>{

timeline.innerHTML+=`<li>${u.name} logged in</li>`

})

}

render()



function deleteUser(i){

history.splice(i,1)

localStorage.setItem("loginHistory",JSON.stringify(history))

render()

}



document.getElementById("searchUser").addEventListener("input",function(){

const val = this.value.toLowerCase()

const rows = table.querySelectorAll("tr")

rows.forEach(r=>{

r.style.display = r.innerText.toLowerCase().includes(val) ? "" : "none"

})

})



document.getElementById("sortType").addEventListener("change",sortData)
document.getElementById("sortOrder").addEventListener("change",sortData)


function sortData(){

const type = document.getElementById("sortType").value
const order = document.getElementById("sortOrder").value

history.sort((a,b)=>{

let v1 = a[type]
let v2 = b[type]

if(type==="time"){
v1 = new Date(v1)
v2 = new Date(v2)
}

if(order==="asc"){
return v1>v2?1:-1
}else{
return v1<v2?1:-1
}

})

render()

}



function clearHistory(){

if(confirm("Clear all login history?")){

localStorage.removeItem("loginHistory")

history=[]

render()

}

}



function exportCSV(){

let csv="Name,Email,Password,Time\n"

history.forEach(u=>{

csv+=`${u.name},${u.email},${u.password},${u.time}\n`

})

const blob=new Blob([csv])

const a=document.createElement("a")

a.href=URL.createObjectURL(blob)

a.download="loginHistory.csv"

a.click()

}



function logout(){

sessionStorage.clear()

window.location.href="index.html"

}



function updateClock(){

const now = new Date()

document.getElementById("clock").textContent = now.toLocaleTimeString()

document.getElementById("date").textContent = now.toDateString()

}

setInterval(updateClock,1000)



const hours = new Array(24).fill(0)

history.forEach(u=>{

const h = new Date(u.time).getHours()

hours[h]++

})


new Chart(document.getElementById("loginChart"),{

type:"bar",

data:{

labels:[
"0","1","2","3","4","5","6","7","8","9","10","11",
"12","13","14","15","16","17","18","19","20","21","22","23"
],

datasets:[{

label:"Logins per Hour",

data:hours

}]

}

})



const themeBtn=document.getElementById("themeButton")
const panel=document.getElementById("themePanel")

themeBtn.onclick=()=>{

panel.style.display = panel.style.display==="flex"?"none":"flex"

}



document.querySelectorAll(".theme-option").forEach(b=>{

b.onclick=()=>{

const t=b.dataset.theme

if(t==="dark"){
document.body.classList.add("dark")
}else{
document.body.classList.remove("dark")
}

localStorage.setItem("themeMode",t)

}

})



document.querySelectorAll(".theme-color").forEach(b=>{

b.onclick=()=>{

const c=b.dataset.color

document.documentElement.style.setProperty("--primary",c)

localStorage.setItem("accentColor",c)

}

})


const savedTheme = localStorage.getItem("themeMode")

if(savedTheme==="dark"){
document.body.classList.add("dark")
}

const savedColor = localStorage.getItem("accentColor")

if(savedColor){
document.documentElement.style.setProperty("--primary",savedColor)
}

const messages = document.querySelectorAll(".admin-message");

let currentMsg = 0;

function changeMessage(){

messages[currentMsg].classList.remove("active");

currentMsg++;

if(currentMsg >= messages.length){
currentMsg = 0;
}

messages[currentMsg].classList.add("active");

}

setInterval(changeMessage,4000);

const slides = document.querySelectorAll(".carousel img");

let currentSlide = 0;

function changeSlide(){

slides[currentSlide].classList.remove("active");

currentSlide++;

if(currentSlide >= slides.length){
currentSlide = 0;
}

slides[currentSlide].classList.add("active");

}

setInterval(changeSlide,5000);

const adminMessages = [

"Monitor system activity and manage users.",
"Track login behaviour across the platform.",
"Analyze CareerAI user engagement.",
"Manage platform security and admin actions.",
"View analytics and system health."

];

let msgIndex = 0;

const msgBox = document.getElementById("adminMessage");

function rotateAdminMessage(){

msgBox.style.opacity = 0;

setTimeout(()=>{

msgBox.textContent = adminMessages[msgIndex];

msgBox.style.opacity = 1;

msgIndex++;

if(msgIndex >= adminMessages.length){
msgIndex = 0;
}

},300);

}

rotateAdminMessage();

setInterval(rotateAdminMessage,4000);