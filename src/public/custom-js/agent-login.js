form.addEventListener("submit", () =>{
    const agentlogin = {
        email: email.value,
        password: password.value,
        user_role: 2
    }

    fetch("/api/agent-login", {
        method: "post",
        body: JSON.stringify(agentlogin),
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
        window.location.href = "/agent-dashboard";
       }
    })
})