paypal.Buttons({

    createOrder: function() {
  
      // This function sets up the details of the transaction, including the amount and line item details.
  
      return fetch('/create-o-order',{
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            items:[{
                id:1,
                quantity: 2
            },
            {
                id:2,
                quantity: 3
            }],

        })
      }).then(res => {
        if (res.ok) return res.json()
        return res.json().then(json => Promise.reject(json))
      }).then(({id})=>{
        return id
      }).catch(e =>{
        console.error(e.error)
      })
  
    },
  
    onApprove: function(data, actions) {
  
      // This function captures the funds from the transaction.
  
      return actions.order.capture().then(function(details) {
  
        // This function shows a transaction success message to your buyer.
  
        alert('Transaction completed by ' + details.payer.name.given_name);
  
      });
  
    }
  
  }).render('#paypal');
  
  //This function displays payment buttons on your web page.