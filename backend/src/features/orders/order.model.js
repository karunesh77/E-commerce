import mongoose from "mongoose";

// Order place karte waqt product ka snapshot lena zaroori hai
// Kyun? Product baad mein delete ya price change ho sakta hai
// Lekin order ka record hamesha accurate rehna chahiye
const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:     { type: String, required: true },   // snapshot
  image:    { type: String, default: "" },       // snapshot
  price:    { type: Number, required: true },    // snapshot — us waqt ka price
  quantity: { type: Number, required: true, min: 1 },
  size:     { type: String, default: null },
  color:    { type: String, default: null },
});

// Delivery address ka snapshot — user baad mein address change kare toh bhi order sahi rahe
const shippingAddressSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  phone:   { type: String, required: true },
  street:  { type: String, required: true },
  city:    { type: String, required: true },
  state:   { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
});

// Status change hone pe timeline track karo — customer ko tracking dikhane ke liye
const timelineSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],

    shippingAddress: shippingAddressSchema,

    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total:    { type: Number, required: true },
    },

    coupon: { type: String, default: null },

    // Payment details
    payment: {
      method: {
        type: String,
        enum: ["razorpay", "cod"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      razorpayOrderId:   { type: String, default: null },
      razorpayPaymentId: { type: String, default: null },
      razorpaySignature: { type: String, default: null },
      paidAt:            { type: Date, default: null },
    },

    // Order lifecycle status
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // Tracking timeline — har status change yahan record hoga
    statusTimeline: [timelineSchema],

    // Cancel details
    cancelReason:  { type: String, default: null },
    cancelledAt:   { type: Date, default: null },

    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes — orders list karne aur dhundne ke liye fast queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.razorpayOrderId": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
