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
              quantity: 1,
            },
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

        window.location.href = `/payment/${userID}/capture`

      });
    },
  })
  .render("#paypal")