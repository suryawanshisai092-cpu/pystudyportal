let currentStudentSection = "notes";
let isLogin = true;
let editId = null;

let allNotes = [];

// 🔗 Render Backend URL
const API = "https://studyx-backend-brif.onrender.com";

/* ---------- DEFAULT LANDING ---------- */
window.onload = function () {
  landing.style.display = "block";
  panel.style.display = "none";
  dashboard.style.display = "none";
  studentPage.style.display = "none";

  loadAllNotes();
};

/* ---------- LOAD ALL NOTES ---------- */
function loadAllNotes(){

  fetch(API + "/getNotes")
  .then(res=>res.json())
  .then(data=>{
      allNotes = data;
      loadStudentNotesByYear();
  });

}

/* ---------- OPEN LOGIN PANEL ---------- */
function openPanel(){
  landing.style.display = "none";
  panel.style.display = "block";

  const wrap = document.getElementById("wrap");
  wrap.style.transform = "translateX(0)";
  isLogin = true;
}

function goBack(){
  panel.style.display = "none";
  landing.style.display = "flex";
}

/* ---------- LOGIN ↔ REGISTER TOGGLE ---------- */
function toggle(){
  const wrap = document.getElementById("wrap");

  if(isLogin){
    wrap.style.transform = "translateX(-50%)";
  } else {
    wrap.style.transform = "translateX(0%)";
  }

  isLogin = !isLogin;
}

/* ---------- REGISTER ---------- */
function checkRegister() {

  const u = regUser.value.trim();
  const e = regEmail.value.trim();
  const p = regPass.value.trim();

  if (!u || !e || !p) {
    regError.textContent = "All fields required";
    return;
  }

  fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type":"application/x-www-form-urlencoded"},
    body:`username=${encodeURIComponent(u)}&email=${encodeURIComponent(e)}&password=${encodeURIComponent(p)}`
  })
  .then(res=>res.text())
  .then(data=>{
    if(data==="SUCCESS"){
      alert("Registration successful");
      toggle();
    } else {
      regError.textContent="Registration failed";
    }
  });
}

/* ---------- LOGIN ---------- */
function checkLogin(){

  const u = loginUser.value.trim();
  const p = loginPass.value.trim();

  fetch(API + "/login",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`username=${encodeURIComponent(u)}&password=${encodeURIComponent(p)}`
  })
  .then(res=>res.text())
  .then(data=>{

    panel.style.display="none";
    dashboard.style.display="none";
    studentPage.style.display="none";

    if(data==="ADMIN"){
      dashboard.style.display="flex";
      welcomeText.innerText="Welcome Admin";
      loadAdminNotes();
    }
    else if(data==="STUDENT"){
      studentPage.style.display="block";
      openStudentSection("notes");
    }
    else{
      panel.style.display="block";
      loginError.textContent="Invalid username or password";
    }

  });

}

/* ---------- ADMIN LOAD NOTES ---------- */
function loadAdminNotes(){

  fetch(API + "/getNotes")
  .then(res=>res.json())
  .then(notes=>{

    const box=document.getElementById("adminCards");
    box.innerHTML="";

    if(notes.length===0){
      box.innerHTML="<p>No notes</p>";
      return;
    }

    notes.forEach(n=>{

      box.innerHTML+=`

      <div class="card" data-year="${n.year}" data-type="${n.category}">

      <div class="card-actions">

      <button class="edit-btn"
      onclick="editNote(${n.id},'${escapeHtml(n.title)}','${escapeHtml(n.description)}','${n.year}','${n.category}')">
      ✏️
      </button>

      <button class="delete-btn" onclick="deleteNote(${n.id})">
      🗑
      </button>

      </div>

      <h3>${escapeHtml(n.title)}</h3>
      <p>${escapeHtml(n.description)}</p>
      <a class="btn" href="${n.file_url}" target="_blank">Open</a>

      </div>

      `;

    });

  });

}

/* ---------- DELETE NOTE ---------- */
function deleteNote(id){

  if(!confirm("Delete this note?")) return;

  fetch(API + "/deleteNote?id="+id)
  .then(res=>res.text())
  .then(data=>{
    if(data==="SUCCESS"){
      loadAdminNotes();
    } else {
      alert("Delete failed");
    }
  });

}

/* ---------- STUDENT LOAD NOTES ---------- */
function loadStudentNotesByYear(){

  const year = document.getElementById("yearFilter").value;

  let category="";
  let cardId="";

  if(currentStudentSection==="notes"){
    category="Notes";
    cardId="notesCards";
  }

  if(currentStudentSection==="books"){
    category="Books";
    cardId="booksCards";
  }

  if(currentStudentSection==="imp"){
    category="Imp";
    cardId="impCards";
  }

  fetch(API + "/getNotes?year="+year)
  .then(res=>res.json())
  .then(notes=>{

    const box=document.getElementById(cardId);
    box.innerHTML="";

    notes
    .filter(n=>n.category===category)
    .forEach(n=>{

      box.innerHTML+=`
        <div class="card">
          <h3>${n.title}</h3>
          <p>${n.description}</p>
          <a class="btn" href="${n.file_url}" target="_blank">Open</a>
        </div>
      `;

    });

  });

}

/* ---------- ADD NOTE ---------- */
function addNote(){

  const title=noteTitle.value.trim();
  const desc=noteDesc.value.trim();
  const link=noteLink.value.trim();
  const category=document.getElementById("noteCategory").value;
  const year=document.getElementById("noteYear").value;

  if(!title||!desc||!link){
    noteError.textContent="Fill all fields";
    return;
  }

  const params=new URLSearchParams();
  params.append("title",title);
  params.append("description",desc);
  params.append("fileUrl",link);
  params.append("category",category);
  params.append("year",year);

  fetch(API + "/uploadNote",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:params.toString()
  })
  .then(res=>res.text())
  .then(data=>{
    if(data==="SUCCESS"){
      alert("Added successfully");
      loadAdminNotes();
    }
  });

}

/* ---------- LOGOUT ---------- */
function logout(){
  location.reload();
}

/* ---------- ESCAPE HTML ---------- */
function escapeHtml(str){

  return String(str)
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;");

}


function sendOTP(){

  const email = regEmail.value.trim();

  fetch(API + "/sendOTP",{
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`email=${encodeURIComponent(email)}`
  })
  .then(res=>res.text())
  .then(data=>{
      if(data==="OTP_SENT"){
          alert("OTP sent to email");
      }
  });

}
