// TEMPORARILY DISABLED — Razorpay init boot pe crash karta tha jab env vars
// container/Lambda mein set na hon. Payment feature enable karne se pehle:
//   1. .env mein RAZORPAY_KEY_ID / KEY_SECRET set karo
//   2. Neeche wala code uncomment karo (aur is stub ko hataao)
//   3. routes/index.js mein "paymentRoutes" wali line bhi uncomment karo

// import Razorpay from "razorpay";
//
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });
//
// export default razorpay;

export default null;
