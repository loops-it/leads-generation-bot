form.addEventListener("submit", () =>{
    if(password.value == "" && confirm_password.value== "" && current_password.value== ""){
        const user_details = {
            admin_name: admin_name.value,
            phone: phone.value,
            email: email.value,
            user_id: user_id.value,
        }
        
        fetch("admin-update", {
            method: "post",
            body: JSON.stringify(user_details),
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
    else{
        if(password.value != confirm_password.value){
            document.getElementById('password-error').style.display = 'block';
            document.getElementById('password-error').textContent = 'Passwords dose not match';
        }
        else{
        const password_data = {
            current_password: current_password.value,
            user_id: user_id.value,
        }
        
        fetch("user-check-current-password", {
            method: "post",
            body: JSON.stringify(password_data),
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
            const user_details = {
                admin_name: admin_name.value,
                phone: phone.value,
                email: email.value,
                user_id: user_id.value,
                password: password.value,
            }
            
            fetch("/api/admin-update-with-password", {
                method: "post",
                body: JSON.stringify(user_details),
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
    }
    }
})