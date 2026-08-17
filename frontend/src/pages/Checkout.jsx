import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { createRazorpayOrderApi, verifyPaymentApi, placeCodOrderApi } from "../api/payments.api";
import { resetCart } from "../store/slices/cartSlice";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { summary, items } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  const handleChange = (e) => setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);

    try {
      if (paymentMethod === "cod") {
        const res = await placeCodOrderApi({ paymentMethod: "cod", shippingAddress: address });
        dispatch(resetCart());
        toast.success("Order placed successfully!");
        navigate(`/orders/${res.data.data._id}`);
        return;
      }

      // Razorpay flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Could not load payment gateway. Check your connection.");
        setPlacing(false);
        return;
      }

      const { data } = await createRazorpayOrderApi({ paymentMethod: "razorpay", shippingAddress: address });
      const orderData = data.data;

      const razorpay = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "VybeShop",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: address.name,
          contact: address.phone,
          email: user?.email,
        },
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            const verifyRes = await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              shippingAddress: address,
              paymentMethod: "razorpay",
            });
            dispatch(resetCart());
            toast.success("Payment successful! Order placed.");
            navigate(`/orders/${verifyRes.data.data._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || "Payment verification failed");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return <div className="py-24 text-center text-sm text-gray-500">Your cart is empty.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Shipping Address</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                name="name" required placeholder="Full name" value={address.name} onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                name="phone" required placeholder="10-digit mobile number" value={address.phone} onChange={handleChange}
                pattern="[6-9][0-9]{9}"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                name="street" required placeholder="Street address" value={address.street} onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                name="city" required placeholder="City" value={address.city} onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="state" required placeholder="State" value={address.state} onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                name="pincode" required placeholder="Pincode" value={address.pincode} onChange={handleChange}
                pattern="[0-9]{6}"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Payment Method</h2>
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 rounded-md border border-gray-300 p-3 text-sm">
                <input
                  type="radio" name="paymentMethod" value="razorpay"
                  checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")}
                />
                Pay online (UPI / Card / NetBanking) — Razorpay
              </label>
              <label className="flex items-center gap-2 rounded-md border border-gray-300 p-3 text-sm">
                <input
                  type="radio" name="paymentMethod" value="cod"
                  checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
            </div>
          </div>
        </div>

        <div className="h-fit rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{summary.subtotal?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{summary.shipping === 0 ? "Free" : `₹${summary.shipping}`}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>₹{summary.total?.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={placing}
            className="mt-5 w-full rounded-md bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
