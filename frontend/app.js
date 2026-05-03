function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function clearSearch() {
  document.getElementById("searchResult").innerHTML = "";
  document.getElementById("searchInput").value = "";
}
function loadUserCount() {
  fetch("http://localhost:3000/count")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("userCount").innerText = data.count;
      }
    });
}
let countInterval;

//count all in home section
function loadHomeStats() {
  fetch("http://localhost:3000/count")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("totalUsers").innerText = data.count;
      }
    });

  fetch("http://localhost:3000/admin-count")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("adminCount").innerText = data.count;
      }
    });

  fetch("http://localhost:3000/user-count")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("normalUsers").innerText = data.count;
      }
    });

}

document.addEventListener("DOMContentLoaded", () => {
  console.log("JS working");
  const navbar = document.querySelector(".navbar");
  const form = document.getElementById("loginForm");

  // hide navbar initially
  navbar.classList.add("hidden");
  showPage("loginPage");

  // LOGIN
   if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      console.log("Login clicked"); // debug

      const emal = e.target.emal.value;
      const password = e.target.password.value;

      fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emal, password })
      })
      .then(res => res.json())
      .then(data => {
        console.log(data); // debug

        if (data.success) {
          showPage("dashboardPage");
          navbar.classList.remove("hidden");
          document.querySelector(".navbar h1").innerText =
          "Welcome " + data.emal;
          loadHomeStats(); 
        } else {
          alert("Login failed");
        }
      })
      .catch(err => {
        console.log("Error:", err);
      });
    });
  }



  // LOGOUT
  document.getElementById("logoutBtn").onclick = () => {
    showPage("loginPage");
    navbar.classList.add("hidden"); // ✅ hide navbar
    clearSearch(); 
    clearInterval(countInterval);
  };

  //search btn
  document.getElementById("searchBtn").onclick = () => {

    const emal = document.getElementById("searchInput").value;
   
    fetch(`http://localhost:3000/search-user?emal=${emal}`)
      .then(res => res.json())
      .then(data => {
        const box = document.getElementById("searchResult");
        if (!data.success) {
          box.innerHTML = `<p class="error-text">❌ User not found</p>`;
          return;
        }
        const user = data.user;
        box.innerHTML = `
          <div class="user-card">
            <p><b>👤 Name:</b> ${user.username}</p>
            <p><b>📧 Email:</b> ${user.emal}</p>
            <p><b>🛡 Role:</b> ${user.role}</p>
          </div>
        `;
      });
  };

  // navigation
  document.getElementById("goSignup").onclick = () => showPage("signupPage");
  document.getElementById("goLogin").onclick = () => showPage("loginPage");

  // sidebar
  document.getElementById("homeBtn").onclick = () => {
    document.getElementById("homeSection").style.display = "block";
    document.getElementById("userSection").style.display = "none";
    loadUserCount()
    clearSearch();
    clearInterval(countInterval); 
  };

  document.getElementById("usersBtn").onclick = () => {
    document.getElementById("homeSection").style.display = "none";
    document.getElementById("userSection").style.display = "block";
    clearSearch(); 
    loadHomeStats()
    countInterval = setInterval(loadUserCount, 3000); 
  };

});

