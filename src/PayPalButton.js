import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const PayPalButton = ({
  currency,
  options,
  amount,
  shippingPreference,
  onSuccess,
  catchError,
  createSubscription,
  createOrder,
  onApprove,
  style,
  onButtonReady,
  ...props
}) => {
  const [isSdkReady, setIsSdkReady] = useState(false);

  const addPaypalSdk = () => {
    const queryParams = [];

    // replacing camelCase with dashes
    Object.keys(options).forEach((k) => {
      const name = k
        .split(/(?=[A-Z])/)
        .join("-")
        .toLowerCase();
      queryParams.push(`${name}=${options[k]}`);
    });

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://www.paypal.com/sdk/js?${queryParams.join("&")}`;
    script.async = true;
    script.onload = () => {
      setIsSdkReady(true);

      if (onButtonReady) {
        onButtonReady();
      }
    };
    script.onerror = () => {
      throw new Error("Paypal SDK could not be loaded.");
    };

    document.body.appendChild(script);
  };

  const handleCreateOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          description: "Manager To Owner Payment",
          invoice_id: uuidv4(),
          payee: {
            email_address: "sb-ysghy3440762@personal.example.com"
          },
          amount: {
            currency_code:
              currency ||
              (options && options.currency ? options.currency : "USD"),
            value: amount.toString()
          }
        }
      ],
      application_context: {
        shipping_preference: shippingPreference
      }
    });
  };

  const handleOnApprove = (data, actions) => {
    return actions.order
      .capture()
      .then((details) => {
        if (onSuccess) {
          return onSuccess(details, data);
        }

        return null;
      })
      .catch((err) => {
        if (catchError) {
          return catchError(err);
        }

        return null;
      });
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window !== undefined &&
      window.paypal === undefined
    ) {
      addPaypalSdk();
    } else if (
      typeof window !== "undefined" &&
      window !== undefined &&
      window.paypal !== undefined &&
      props.onButtonReady
    ) {
      props.onButtonReady();
    }
  }, []);

  if (
    !isSdkReady &&
    (typeof window === "undefined" || window.paypal === undefined)
  ) {
    return null;
  }

  const Button = window.paypal.Buttons.driver("react", {
    React,
    ReactDOM
  });

  const createOrderFn =
    amount && !createOrder
      ? (data, actions) => handleCreateOrder(data, actions)
      : (data, actions) => createOrder(data, actions);

  return (
    <>
      <Button
        {...props}
        createOrder={createSubscription ? undefined : createOrderFn}
        createSubscription={createSubscription}
        onApprove={
          onSuccess
            ? (data, actions) => handleOnApprove(data, actions)
            : (data, actions) => onApprove(data, actions)
        }
        style={style}
      />
    </>
  );
};

PayPalButton.defaultProps = {
  style: {},
  options: {
    clientId: "sb",
    currency: "USD"
  },
  shippingPreference: "GET_FROM_FILE"
};

PayPalButton.propTypes = {
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  currency: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onSuccess: PropTypes.func,
  catchError: PropTypes.func,
  onError: PropTypes.func,
  createOrder: PropTypes.func,
  createSubscription: PropTypes.func,
  onApprove: PropTypes.func,
  style: PropTypes.object,
  shippingPreference: PropTypes.string,
  options: PropTypes.shape({
    clientId: PropTypes.string,
    merchantId: PropTypes.string,
    currency: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    intent: PropTypes.string,
    commit: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    vault: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    component: PropTypes.string,
    disableFunding: PropTypes.string,
    disableCard: PropTypes.string,
    integrationDate: PropTypes.string,
    locale: PropTypes.string,
    buyerCountry: PropTypes.string,
    debug: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    description: PropTypes.string,
    payee: {
      email_address: PropTypes.string
    }
  }),
  onButtonReady: PropTypes.func
};

export default PayPalButton;
