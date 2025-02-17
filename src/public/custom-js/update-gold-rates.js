form.addEventListener("submit", () =>{

        const user_details = {
            gold_rate_22k: gold_rate_22k.value,
            old_gold_exchange_rate: old_gold_exchange_rate.value,
            gold_coin_price: gold_coin_price.value,
            id: id.value,
        }
        
        fetch("/api/update-gold-rates", {
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
 
})