import Cart from "./cart.model.js";

// User ka cart laao, agar nahi hai toh banao
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// Cart ko populate karke totals calculate karo
// Frontend ko ready-to-display data milta hai
export const formatCart = async (cart) => {
  // Products ki latest details laao
  await cart.populate({
    path: "items.product",
    select: "name slug price discountPrice images stock",
  });

  let subtotal = 0;
  let totalItems = 0;

  // Sirf valid products rakho (product delete ho gaya ho toh skip)
  const formattedItems = cart.items
    .filter((item) => item.product !== null)
    .map((item) => {
      const product = item.product;
      // Discount price hai toh wahi use karo, warna original
      const price = product.discountPrice ?? product.price;
      const itemTotal = price * item.quantity;

      subtotal += itemTotal;
      totalItems += item.quantity;

      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images[0]?.url || null,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
        },
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price,
        itemTotal,
      };
    });

  return {
    _id: cart._id,
    items: formattedItems,
    summary: {
      totalItems,                              // total quantity (e.g. 5 items)
      uniqueItems: formattedItems.length,      // distinct products (e.g. 3 products)
      subtotal,
      shipping: subtotal > 500 ? 0 : 50,       // 500+ pe free shipping
      total: subtotal + (subtotal > 500 ? 0 : 50),
    },
  };
};
