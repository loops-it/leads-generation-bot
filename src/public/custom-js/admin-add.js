form.addEventListener("submit", () =>{
    if(password.value != confirm_password.value){
        document.getElementById('password-error').style.display = 'block';
        document.getElementById('password-error').textContent = 'Passwords dose not match';
    }
    else{
        document.getElementById('password-error').style.display = 'none';
        document.getElementById('password-error').textContent = ''; 
        const adminadd = {
            name: admin_name.value,
            phone: phone.value,
            email: email.value,
            password: password.value,
            user_role: 1
        }
    
        fetch("admin-add", {
            method: "post",
            body: JSON.stringify(adminadd),
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
            success.style.display = "block"
            failed.style.display = "none"
            success.innerText = data.message
           }
        })
    }
    
})