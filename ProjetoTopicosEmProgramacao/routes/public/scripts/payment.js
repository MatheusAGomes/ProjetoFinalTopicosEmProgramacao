const userID = document.getElementById("funciona").textContent.substr(1);

paypal
  .Buttons({
    createOrder: function () {
      return fetch("/:id/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              id: 1,
              quantity: 2,
            },
            { id: 2, quantity: 3 },
          ],
        }),
      })
        .then(res => {
          if (res.ok) return res.json()
          return res.json().then(json => Promise.reject(json))
        })
        .then(({ id }) => {
          return id
        })
        .catch(e => {
          console.error(e.error)
        })
    },
    onApprove: function (data, actions) {
      return actions.order.capture().then(function(orderData) {

        // Successful capture! For dev/demo purposes:
        console.log(data)
        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));

        const transaction = orderData.purchase_units[0].payments.captures[0];

        console.log(`Transaction ${transaction.status}: ${transaction.id}\n\nSee console for all available details`);

        // When ready to go live, remove the alert and show a success message within this page. For example:

        // const element = document.getElementById('paypal-button-container');

        // element.innerHTML = '<h3>Thank you for your payment!</h3>';

        actions.redirect(`http://localhost:3000/payment/${userID}/capture`)

      });
    },
  })
  .render("#paypal")