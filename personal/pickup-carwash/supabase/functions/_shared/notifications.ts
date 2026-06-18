interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
}

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!expoPushToken) {
    console.log("No push token, skipping push notification");
    return;
  }

  const payload: PushNotificationPayload = {
    to: expoPushToken,
    title,
    body,
    data,
    sound: "default",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Expo push error:", errorText);
    }
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    console.log("Twilio not configured, skipping SMS");
    return;
  }

  if (!phone) {
    console.log("No phone number, skipping SMS");
    return;
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twilio SMS error:", errorText);
    }
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

export const NOTIFICATION_TEMPLATES = {
  confirmed: {
    title: "Booking Confirmed",
    body: (merchantName: string, date: string) =>
      `Your booking at ${merchantName} on ${date} is confirmed.`,
  },
  picked_up: {
    title: "Car Picked Up",
    body: () => "Your car has been picked up. We'll return it fresh!",
  },
  in_progress: {
    title: "Wash In Progress",
    body: (merchantName: string) => `Your car is being washed at ${merchantName}.`,
  },
  completed: {
    title: "Car Returned",
    body: (merchantName: string) =>
      `Your car is back! Rate your experience with ${merchantName}.`,
  },
  cancelled: {
    title: "Booking Cancelled",
    body: (merchantName: string) =>
      `Your booking at ${merchantName} was cancelled. Refund on the way.`,
  },
} as const;
