export const CALENDLY_URL = "https://calendly.com/stef-soul-wlsn/corp-crunch-connect-to-partner-up"
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  FAILED: "FAILED",
  PAID: "PAID",
  SUCCESS: "SUCCESS",
  CANCEL: "CANCEL",
};

export const PLAN_AMOUNTS = {
  THREE_MONTH: "750.00",
  SIX_MONTH: "1050.00",
  ONE_YEAR: "1500.00",
};
export const planIDs = {
  THREE_MONTH: "3_MONTHS",
  SIX_MONTH: "6_MONTHS",
  ONE_YEAR: "1_YEAR",
};
export const planDetails = [
  {
    id: planIDs.THREE_MONTH,
    title: "Silver (Quarter)",
    benefits: [
      "Access exclusive content and insights for 3 months",
      "Stay up-to-date with the latest blog posts and articles",
      `Just ₹${PLAN_AMOUNTS.THREE_MONTH} every 3 months`,
    ],
    amount: PLAN_AMOUNTS.THREE_MONTH,
    btnText: `Pay ₹${PLAN_AMOUNTS.THREE_MONTH} every 3 months`,
  },
  {
    id: planIDs.SIX_MONTH,
    title: "Gold (Biannual)",
    benefits: [
      "Get 30% off for 6 months",
      "Enjoy unlimited access to premium content",
      "Get direct access to networking events",
      `Just ₹${PLAN_AMOUNTS.SIX_MONTH} every 6 months`,
    ],
    amount: PLAN_AMOUNTS.SIX_MONTH,
    btnText: `Pay ₹${PLAN_AMOUNTS.SIX_MONTH} every 6 months`,
  },
  {
    id: planIDs.ONE_YEAR,
    title: "Platinum (Annual)",
    benefits: [
      "Get 50% off for a year",
      "Enjoy unlimited access to premium content",
      "Get exclusive magazine & direct access to networking events",
      `Just ₹${PLAN_AMOUNTS.ONE_YEAR} every year`,
    ],
    amount: PLAN_AMOUNTS.ONE_YEAR,
    btnText: `Pay ₹${PLAN_AMOUNTS.ONE_YEAR} every 1 year`,
  },
];
