import dotenv from "dotenv";

dotenv.config();

const mpesaBaseURL = "https://sandbox.safaricom.co.ke";

const consumerKey = process.env.CONSUMERKEY;
const consumerSecret = process.env.CONSUMERSECRET;
const shortcode = "174380"; // MPesa Shortcode
const passkey = "174380";

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

  const data = await response.json(); // Parse the JSON from the response
  return data.access_token; // Return the access token
};

export const Mpesapay = async (req, res, next) => {
    const { phoneNumber, amount } = req.body;
    console.log("Initiating MPesa payment...");
  
    // Format the phone number
    const formattedPhoneNumber = phoneNumber.startsWith('254')
      ? phoneNumber // Already in the correct format
      : `254${phoneNumber.substring(1)}`; // Convert from '0xxxx' to '2547xxxx'
  
    console.log("Formatted phone number:", formattedPhoneNumber);
  
    try {
      console.log("Received payment request:", { phoneNumber: formattedPhoneNumber, amount });
  
      // Get MPesa token
      const token = await getMpesaToken();
      console.log("MPesa token obtained:", token);
  
      // Generate timestamp and password
      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);
      console.log("Generated timestamp:", timestamp);
  
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString(
        "base64"
      );
      console.log("Generated password:", password);
  
      // Prepare payment data
      const paymentData = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhoneNumber, // Customer's phone number
        PartyB: shortcode, // The MPesa Paybill/Shortcode
        PhoneNumber: formattedPhoneNumber,
        CallBackURL: "https://eaaa-102-214-72-6.ngrok-free.app/api/payments/mpesa/callback", // Set your callback URL
        AccountReference: "Booking123",
        TransactionDesc: "Hotel booking payment",
      };
      console.log("Prepared payment data:", paymentData);
  
      // Make the fetch request to MPesa API
      const response = await fetch(
        `${mpesaBaseURL}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData), // Send paymentData as JSON
        }
      );
  
      // Check if the response was successful
      if (!response.ok) {
        const errorResponse = await response.json(); // Get error details from response
        console.error("Error response from MPesa:", errorResponse);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorResponse}`);
      }
  
      // Parse the response as JSON
      const responseData = await response.json();
      console.log("MPesa payment response:", responseData);
  
      // Send back the data to the frontend
      res.status(200).json({ status: "pending", data: responseData });
    } catch (error) {
      console.error("Error processing MPesa payment:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ error: "Payment request failed", details: error.message });
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

