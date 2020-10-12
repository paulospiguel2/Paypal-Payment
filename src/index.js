import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import PayPalButton from "./PayPalButton";

function App() {
  return (
    <div className="App">
      <h1>Paypal payment sendbox</h1>
      <PayPalButton
        amount={0.01}
        onSuccess={() => alert("Success")}
        onError={(error) => console.log({ error })}
        options={{
          clientId: "sd",
          payee: {
            email_address: "sb-tuowp3440489@personal.example.com"
          },
          description: `Payment made by the ...`
        }}
        style={{
          label: "pay"
        }}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
