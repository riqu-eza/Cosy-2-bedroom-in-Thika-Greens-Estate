import dotenv from "dotenv";

dotenv.config();

const mpesaBaseURL = "https://sandbox.safaricom.co.ke";
const callbackURL = process.env.MPESA_CALLBACK_URL; // Your callback URL
const recipientPhoneNumber = process.env.RECIPIENTPHONE 
const consumerKey = process.env.CONSUMERKEY;
const consumerSecret = process.env.CONSUMERSECRET;
const shortcode = "174379"; // MPesa Shortcode
const passkey = "1234";

const getMpesaToken = async (req, res) => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const response = await fetch(
    `${mpesaBaseURL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );
  // Check if the response is OK (status in the range 200-299)
  if (!response.ok) {
    const errorMessage = await response.text(); // Get the error message if response is not ok
    throw new Error(`Error fetching token: ${errorMessage}`);
  }

  const data = await response.json();
  console.log('token',data)
   // Parse the JSON from the response
  return data.access_token; // Return the access token
};


export const Mpesapay = async (req, res) => {
  const { phoneNumber, amount,  } = req.body;

  if (!phoneNumber || !amount ) {
    return res.status(400).json({ error: "Missing required fields (phoneNumber, amount, recipientPhoneNumber)." });
  }

  console.log("Initiating MPesa payment...");

  // Format the phone number if needed
  const formattedPhoneNumber = phoneNumber.startsWith("254") ? phoneNumber : `254${phoneNumber.substring(1)}`;

  // Step 1: Receive full payment via MPesa
  try {
    const token = await getMpesaToken();
console.log("tokeny", token)
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const paymentData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: formattedPhoneNumber,
      PartyB: shortcode,
      PhoneNumber: formattedPhoneNumber,
      CallBackURL: callbackURL,
      AccountReference: "airbnb",
      TransactionDesc: "Hotel booking payment",
    };
console.log('datasent', paymentData);
    const response = await fetch(`${mpesaBaseURL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(`Error initiating payment: ${JSON.stringify(responseData)}`);
    }

    console.log("Payment initiated:", responseData);

    // Step 2: Distribute funds
    const amountToPhone = amount * 0.95; // 95% to recipient's phone
    const amountToAccountA = amount * 0.05; // 5% to your account (no action needed)

    console.log("Distributing payment...");

    // Send 95% to recipient's phone
    const distributionResponse = await sendMoneyToPhone(recipientPhoneNumber, amountToPhone, token);

    res.status(200).json({
      status: "Payment initiated and funds distributed",
      paymentDetails: responseData,
      distributionDetails: distributionResponse,
    });
  } catch (error) {
    console.error("Error processing payment:", error.message);
    res.status(500).json({ error: "Payment request failed", details: error.message });
  }
};

// Function to send money to the recipient phone number (95%)
const sendMoneyToPhone = async (recipientPhoneNumber, amount, token) => {
  try {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const paymentData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: recipientPhoneNumber,
      PartyB: shortcode,
      PhoneNumber: recipientPhoneNumber,
      CallBackURL:callbackURL,
      AccountReference: "PaymentDistribution",
      TransactionDesc: "Payment distribution",
    };

    const response = await fetch(`${mpesaBaseURL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(`Error sending money to recipient phone: ${JSON.stringify(responseData)}`);
    }

    console.log("Funds distributed successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error during fund distribution:", error.message);
    throw new Error("Error during fund distribution.");
  }
};
  

  export const Mpesafall = async (req, res) => {
    const paymentResponse = req.body; // Ensure you're capturing the request body
  
    console.log("Received payment response:", paymentResponse); // Log the entire response for debugging
  
    try {
      // Check if the response has the expected structure
      if (paymentResponse.Body && paymentResponse.Body.stkCallback) {
        const resultCode = paymentResponse.Body.stkCallback.ResultCode;

        // Update booking status based on result code
        if (resultCode === 0) {
          console.log("Payment successful", paymentResponse.Body.stkCallback);
          // Update the booking status in your database
          // Example: await updateBookingStatus(paymentResponse.Body.stkCallback);

          res.status(200).json({
            message: "Payment confirmed",
            data: paymentResponse.Body.stkCallback,
          });
        } else {
          console.error("Payment failed", paymentResponse.Body.stkCallback);
          res.status(400).json({
            message: "Payment failed",
            details: paymentResponse.Body.stkCallback,
          });
        }
      } else {
        console.error("Invalid payment response structure:", paymentResponse);
        res.status(400).json({ message: "Invalid payment response" });
      }
    } catch (error) {
      console.error("Error processing payment response:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "An error occurred while processing the payment response", error: error.message });
    }
};

