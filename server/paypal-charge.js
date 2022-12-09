//paypal
exports.handler = async (event, context) => {
    try {
    if (event.httpMethod === "GET") {
        const createOrderPayload = {
            purchase_units: [
                {
                    amount: {
                        value: "10.00"
                    }
                }
            ]
        };

        return {
            statusCode: 200,
            body: JSON.stringify({ createOrderPayload: createOrderPayload }),
        };
    } else {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "METHOD NOT ALLOWED" }),
        };
    }
} catch (err) {

    console.log("11");
    console.log("Error: " + err);
    return {
      statusCode: 400,
      body: err,
    };

  }
};