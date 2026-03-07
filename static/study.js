let currentStudentSection = "notes";
let isLogin = true;
let editId = null;

let allNotes = [];

/* ---------- DEFAULT LANDING ---------- */
window.onload = function () {
  landing.style.display = "block";
  panel.style.display = "none";
  dashboard.style.display = "none";
  studentPage.style.display = "none";
};

function loadAllNotes(){

  fetch("/getNotes")
  .then(res=>res.json())
  .then(data=>{
      allNotes = data;
      loadStudentNotesByYear();
  });

}

window.onload = function () {
  landing.style.display = "block";
  panel.style.display = "none";
  dashboard.style.display = "none";
  studentPage.style.display = "none";

  loadAllNotes();
};

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

  fetch("/register", {
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

  fetch("/login",{
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

  fetch("/getNotes")
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

  fetch("/deleteNote?id="+id)
  .then(res=>res.text())
  .then(data=>{
    if(data==="SUCCESS"){
      loadAdminNotes();
    } else {
      alert("Delete failed");
    }
  });

}

/* ---------- STUDENT SECTION ---------- */
function openStudentSection(type){

  currentStudentSection = type;

  document.getElementById("notesPage").style.display="none";
  document.getElementById("booksPage").style.display="none";
  document.getElementById("impPage").style.display="none";

  document.getElementById("btnNotes").classList.remove("active");
  document.getElementById("btnBooks").classList.remove("active");
  document.getElementById("btnImp").classList.remove("active");

  let category="";
  let cardId="";

  if(type==="notes"){
    document.getElementById("notesPage").style.display="block";
    document.getElementById("btnNotes").classList.add("active");
    category="Notes";
    cardId="notesCards";
  }

  if(type==="books"){
    document.getElementById("booksPage").style.display="block";
    document.getElementById("btnBooks").classList.add("active");
    category="Books";
    cardId="booksCards";
  }

  if(type==="imp"){
    document.getElementById("impPage").style.display="block";
    document.getElementById("btnImp").classList.add("active");
    category="Imp";
    cardId="impCards";
  }

  loadStudentCategory(category,cardId);

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

  fetch("/getNotes?year="+year)
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




function loadStudentCategory(category,cardId){

  const year=document.getElementById("yearFilter").value;

  fetch("/getNotes?year="+year)
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

/* ---------- ADD OR UPDATE NOTE ---------- */
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

  if(editId){

    fetch("/updateNote",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        id:editId,
        title:title,
        description:desc,
        category:category,
        year:year
      })
    })
    .then(()=>{

      editId=null;
      loadAdminNotes();

    });

  } else {

    const params=new URLSearchParams();
    params.append("title",title);
    params.append("description",desc);
    params.append("fileUrl",link);
    params.append("category",category);
    params.append("year",year);

    fetch("/uploadNote",{
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


const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("loginPass");

togglePassword.addEventListener("click", function(){

  if(passwordInput.type === "password"){
      passwordInput.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
  } 
  else{
      passwordInput.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
  }

});

const yearFilter = document.getElementById("adminYearFilter");
const typeFilter = document.getElementById("adminTypeFilter");

yearFilter.addEventListener("change", filterAdminCards);
typeFilter.addEventListener("change", filterAdminCards);

function filterAdminCards(){

  const yearValue = yearFilter.value;
  const typeValue = typeFilter.value;

  const cards = document.querySelectorAll("#adminCards .card");

  cards.forEach(card => {

    const cardYear = card.getAttribute("data-year");
    const cardType = card.getAttribute("data-type");

    const yearMatch = (yearValue === "all" || cardYear === yearValue);
    const typeMatch = (typeValue === "all" || cardType === typeValue);

    if(yearMatch && typeMatch){
      card.style.display = "block";
    }
    else{
      card.style.display = "none";
    }

  });

}

document.getElementById("searchInput").addEventListener("input", function(){

  const searchValue = this.value.toLowerCase();

  const cards = document.querySelectorAll(".cards .card");

  cards.forEach(card => {

    const title = card.querySelector("h3").innerText.toLowerCase();
    const desc = card.querySelector("p").innerText.toLowerCase();

    if(
      title.includes(searchValue) ||
      desc.includes(searchValue)
    ){
      card.style.display = "block";
    } 
    else{
      card.style.display = "none";
    }

  });

});
const toggleRegPassword = document.getElementById("toggleRegPassword");
const regPasswordInput = document.getElementById("regPass");

toggleRegPassword.addEventListener("click", function(){

  if(regPasswordInput.type === "password"){
      regPasswordInput.type = "text";
      this.classList.remove("fa-eye");
      this.classList.add("fa-eye-slash");
  } 
  else{
      regPasswordInput.type = "password";
      this.classList.remove("fa-eye-slash");
      this.classList.add("fa-eye");
  }

});
