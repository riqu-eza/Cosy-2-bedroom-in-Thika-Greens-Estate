import dotenv from "dotenv";
import { io } from "../SocketServer.js"; // WebSocket instance

dotenv.config();

const mpesaBaseURL = "https://sandbox.safaricom.co.ke";
const callbackURL = process.env.MPESA_CALLBACK_URL;
const callbackURLtimeout = process.env.callbackURLtimeout
const callbackURLresult = process.env.callbackURLresult
const recipientPhoneNumber = process.env.RECIPIENTPHONE;
const consumerKey = process.env.CONSUMERKEY;
const consumerSecret = process.env.CONSUMERSECRET;
const shortcode = process.env.MPESA_SHORTCODE; // MPesa Shortcode
const passkey = process.env.MPESA_PASSKEY;

// Helper to generate timestamp
const getTimestamp = () => {
  const pad = (num) => (num < 10 ? '0' + num : num);
  const now = new Date();
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

// Get Token
const getMpesaToken = async () => {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await fetch(`${mpesaBaseURL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    throw new Error(`Error fetching token: ${await response.text()}`);
  }
  return (await response.json()).access_token;
};

export const Mpesapay = async (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: "Missing required fields (phoneNumber, amount)." });
  }

  const formattedPhoneNumber = phoneNumber.startsWith("254") ? phoneNumber : `254${phoneNumber.substring(1)}`;

  try {
    const token = await getMpesaToken();
    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const paymentData = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount.toString(),
      PartyA: formattedPhoneNumber,
      PartyB: shortcode,
      PhoneNumber: formattedPhoneNumber,
      CallBackURL: callbackURL, // M-Pesa will send confirmation here
      AccountReference: "airbnb",
      TransactionDesc: "Hotel booking payment",
    };

    const response = await fetch(`${mpesaBaseURL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();

    if (responseData.ResponseCode === "0") {
      res.status(200).json({
        message: "STK Push sent. Please check your phone and enter your M-Pesa PIN.",
        CheckoutRequestID: responseData.CheckoutRequestID,
      });
    } else {
      throw new Error("Failed to initiate payment.");
    }
  } catch (error) {
    console.error("Error initiating payment:", error.message);
    res.status(500).json({ error: "Payment initiation failed", details: error.message });
  }
};







// Function to send money to the recipient phone number (95%)
const sendMoneyToPhone = async (recipientPhoneNumber, amount) => {
  try {
    const token = await getMpesaToken(); // Fetch the access token
    const timestamp = getTimestamp(); // Generate timestamp
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const paymentData = {
      InitiatorName: "testapi", // Replace with your MPesa initiator name
      SecurityCredential: "your_encoded_security_credential", // Encode your credential
      CommandID: "BusinessPayment", // Other options: SalaryPayment, PromotionPayment
      Amount: amount, // Amount to send,
      PartyA: shortcode, // Shortcode sending funds
      PartyB: recipientPhoneNumber, // Recipient phone number
      Remarks: "Payment distribution",
      QueueTimeOutURL: callbackURLtimeout, // Replace with your timeout URL
      ResultURL: callbackURLresult, // Replace with your result URL
      Occasion: "PaymentDistribution", // Optional
    };

    console.log("Sending funds to phone with payload:", paymentData);

    const response = await fetch(`${mpesaBaseURL}/mpesa/b2c/v1/paymentrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Error sending money: ${JSON.stringify(responseData)}`);
    }

    console.log("Funds sent successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error during fund distribution:", error.message);
    throw new Error("Failed to send funds to recipient.");
  }
};


export const Mpesafall = async (req, res) => {
  const paymentResponse = req.body;

  try {
    if (paymentResponse.Body && paymentResponse.Body.stkCallback) {
      const { stkCallback } = paymentResponse.Body;
      const resultCode = stkCallback.ResultCode;

      if (resultCode === 0) {
        const receiptNumber = stkCallback.CallbackMetadata.Item.find(
          (item) => item.Name === "MpesaReceiptNumber"
        )?.Value || "N/A";

        console.log("Transaction Successful:", receiptNumber);

        // Emit the success event to the frontend
        io.emit("paymentStatus", {
          status: "success",
          message: "Payment successful",
          MpesaReceiptNumber: receiptNumber,
          CheckoutRequestID: stkCallback.CheckoutRequestID,
        });

        res.status(200).json({ message: "Transaction confirmed." });
      } else {
        console.error("Transaction failed:", stkCallback.ResultDesc);

        io.emit("paymentStatus", {
          status: "failed",
          message: "Payment failed",
          CheckoutRequestID: stkCallback.CheckoutRequestID,
        });

        res.status(400).json({ message: "Transaction failed." });
      }
    } else {
      res.status(400).json({ message: "Invalid payment response structure" });
    }
  } catch (error) {
    console.error("Error processing callback:", error.message);
    res.status(500).json({ message: "Error processing callback" });
  }
};






export const Quetime = async (req,res) =>{
  const well = req.body
  console.log("well,",well)
}
export const ResultUrl = async (req,res) =>{
  const well = req.body
  console.log("well,",well)
}