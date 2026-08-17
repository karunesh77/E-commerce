import Product from "../products/product.model.js";
import Cart from "../cart/cart.model.js";

// ─── STOCK DEDUCT ─────────────────────────────────────────────────────────────
// Order confirm hone ke baad har product ka stock ghata do
export const deductStock = async (items) => {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.product, stock: { $gte: item.quantity } },
      update: { $inc: { stock: -item.quantity } },
    },
  }));

  const result = await Product.bulkWrite(operations);

  // Agar koi product update nahi hua — stock issue
  if (result.modifiedCount !== items.length) {
    throw new Error("Stock update failed — some items may be out of stock");
  }
};

// ─── STOCK RESTORE ────────────────────────────────────────────────────────────
// Order cancel hone pe stock wapas add karo
export const restoreStock = async (items) => {
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: { $inc: { stock: item.quantity } },
    },
  }));
  await Product.bulkWrite(operations);
};

// ─── CART CLEAR ───────────────────────────────────────────────────────────────
// Successful order ke baad cart khali karo
export const clearUserCart = async (userId) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    { items: [] }
  );
};

// ─── CALCULATE PRICING ────────────────────────────────────────────────────────
// Cart items se final pricing calculate karo
export const calculatePricing = (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 500 ? 0 : 50;
  const discount = 0; // coupon logic baad mein add karenge
  const total = subtotal + shipping - discount;

  return { subtotal, shipping, discount, total };
};

// ─── VALIDATE CART ITEMS ──────────────────────────────────────────────────────
// Cart ke products DB se validate karo — stock aur price fresh lao
export const validateAndBuildItems = async (cartItems) => {
  const productIds = cartItems.map((item) => item.product);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  const productMap = {};
  products.forEach((p) => (productMap[String(p._id)] = p));

  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = productMap[String(cartItem.product)];

    if (!product) {
      throw new Error(`Product "${cartItem.product}" not found or inactive`);
    }

    if (product.stock < cartItem.quantity) {
      throw new Error(
        `"${product.name}" has only ${product.stock} items in stock`
      );
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      price: product.discountPrice ?? product.price,
      quantity: cartItem.quantity,
      size: cartItem.size,
      color: cartItem.color,
    });
  }

  return orderItems;
};
