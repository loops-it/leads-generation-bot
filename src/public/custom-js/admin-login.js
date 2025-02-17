form.addEventListener("submit", () =>{
    const adminlogin = {
        email: email.value,
        password: password.value,
        user_role: 1
    }

    fetch("/api/admin-login", {
        method: "post",
        body: JSON.stringify(adminlogin),
        headers: {
            "Content-Type" : "application/json"
        }
    }).then(res => res.json())
    .then(data => {
       if(data.status == "failed"){
        success.style.display = "none"
        failed.style.display = "block"
        failed.innerText = data.message
       }
       else{
        window.location.href = "/admin-dashboard";
       }
    })
})