exports.handler = async (event, context) => {
    
    if (event.httpMethod === "GET") {
        const pk=process.env.STRIPE_PUBLIC_KEY

        return {
            statusCode: 200,
            body: JSON.stringify({pk:pk}),
          };
    } else {
      return {
          statusCode: 400,
          body: JSON.stringify({message: "METHOD NOT ALLOWED"}),
        };
    }
  };