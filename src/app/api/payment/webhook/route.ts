import { type NextRequest, NextResponse } from "next/server";
import midtransclient from "midtrans-client";
import { db } from "~/server/db";
import { env } from "~/env.js";

// Initialize Midtrans Core API client for verification
const apiClient = new midtransclient.CoreApi({
    isProduction: false, // Set to false for sandbox testing
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const notificationJson = await request.json();

    const statusResponse = await apiClient.transaction.notification(notificationJson);
    const orderIdString = statusResponse.order_id.split('-')[1];
    const orderId = parseInt(orderIdString ?? '');
    
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}, Transaction status: ${transactionStatus}, Fraud status: ${fraudStatus}`);

    // Basic security verification (signature key verification can be added)
    if (!orderId || isNaN(orderId)) {
        return NextResponse.json({ status: "error", message: "Invalid Order ID" }, { status: 400 });
    }

    let newStatus = 'pending'; // Default status

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'accept') {
            // Transaction successful and secure
            newStatus = 'paid';
        }
    } else if (transactionStatus == 'settlement') {
        // Transaction successfully settled
        newStatus = 'paid';
    } else if (transactionStatus == 'deny' || transactionStatus == 'cancel' || transactionStatus == 'expire') {
        // Transaction failed or cancelled
        newStatus = 'failed';
    }

    // Update order status in database
    await db.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    });

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
  }
}
