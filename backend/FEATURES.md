# E-commerce Backend Features

## Overview
This document outlines all the features implemented in the e-commerce backend API.

---

## 1. Authentication & Authorization
**Endpoints:** `/api/v1/auth/*`

### Features:
- User registration and login
- JWT-based authentication
- Role-based access control (User, Admin)
- Password reset functionality
- Account security with bcrypt hashing

### Key Endpoints:
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user

---

## 2. Product Management
**Endpoints:** `/api/v1/products/*`

### Features:
- Full CRUD operations for products
- Product images (powered by Cloudinary)
- Stock management
- Product ratings and reviews
- Featured products
- Advanced search with full-text indexing

### Key Endpoints:
- `GET /products` - Get all products with filters, search, pagination
- `GET /products/:id` - Get product details
- `POST /products` - Create product (Admin)
- `PATCH /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Filters:
- Search by name/description/brand (`?q=keyword`)
- Filter by category (`?category=id`)
- Price range filter (`?minPrice=100&maxPrice=5000`)
- Stock availability (`?inStock=true`)
- Featured products (`?isFeatured=true`)
- Sorting (newest, price, rating)
- Pagination

---

## 3. Categories
**Endpoints:** `/api/v1/categories/*`

### Features:
- Category management
- Nested category structure
- Category-wise product filtering

### Key Endpoints:
- `GET /categories` - Get all categories
- `POST /categories` - Create category (Admin)
- `PATCH /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

---

## 4. Shopping Cart
**Endpoints:** `/api/v1/cart/*`

### Features:
- Add/remove products from cart
- Update item quantities
- Cart total calculation
- Persist cart data

### Key Endpoints:
- `GET /cart` - Get user cart
- `POST /cart` - Add item to cart
- `PATCH /cart/:itemId` - Update cart item
- `DELETE /cart/:itemId` - Remove item from cart
- `DELETE /cart` - Clear entire cart

---

## 5. Orders
**Endpoints:** `/api/v1/orders/*`

### Features:
- Order creation from cart
- Order status tracking
- Order history
- Order cancellation
- Detailed order information

### Order Status Flow:
- pending → confirmed → processing → shipped → delivered
- Can be cancelled (if not yet shipped)

### Key Endpoints:
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order
- `PATCH /orders/:id/status` - Update order status (Admin)
- `POST /orders/:id/cancel` - Cancel order

---

## 6. Payments
**Endpoints:** `/api/v1/payments/*`

### Features:
- Razorpay payment integration
- Payment processing and verification
- Payment status tracking
- Invoice generation

### Payment Methods:
- Credit/Debit cards
- UPI
- Wallets
- Net Banking

### Key Endpoints:
- `POST /payments/process` - Process payment
- `POST /payments/verify` - Verify payment
- `GET /payments/:orderId` - Get payment status
- `GET /payments/:orderId/invoice` - Download invoice

---

## 7. Wishlist
**Endpoints:** `/api/v1/wishlist/*`

### Features:
- Add products to wishlist
- Remove from wishlist
- View wishlist items
- Share wishlist
- Get wishlist count

### Key Endpoints:
- `GET /wishlist` - Get user wishlist
- `POST /wishlist` - Add to wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist
- `DELETE /wishlist` - Clear wishlist

---

## 8. Reviews & Ratings
**Endpoints:** `/api/v1/products/:productId/reviews/*`

### Features:
- Submit product reviews
- Rate products (1-5 stars)
- Review moderation
- Helpful votes on reviews
- Photo/video in reviews (coming soon)

### Key Endpoints:
- `GET /products/:productId/reviews` - Get product reviews
- `POST /products/:productId/reviews` - Add review
- `PATCH /reviews/:reviewId` - Update review
- `DELETE /reviews/:reviewId` - Delete review

---

## 9. User Profile & Addresses
**Endpoints:** `/api/v1/users/*`

### Features:
- Complete user profile management
- Multiple delivery addresses
- Default address selection
- Address labels (home, work, other)
- User preferences (newsletter, notifications)

### Key Endpoints:
- `GET /users/profile` - Get user profile
- `PATCH /users/profile` - Update profile
- `GET /users/addresses` - Get all addresses
- `POST /users/addresses` - Add new address
- `PATCH /users/addresses/:addressId` - Update address
- `DELETE /users/addresses/:addressId` - Delete address
- `PUT /users/addresses/:addressId/default` - Set as default

### Profile Fields:
- Phone number
- Date of birth
- Gender
- Profile image
- Bio
- Notification preferences

---

## 10. Coupons & Discounts
**Endpoints:** `/api/v1/coupons/*`

### Features:
- Create promotional coupons
- Percentage and fixed amount discounts
- Minimum order value requirement
- Usage limits (global and per-user)
- Category and product-specific discounts
- Coupon expiry dates
- Coupon validation before checkout

### Key Endpoints:
- `POST /coupons/validate` - Validate coupon code
- `POST /coupons/apply` - Apply coupon to order
- `POST /coupons` - Create coupon (Admin)
- `GET /coupons` - Get all coupons (Admin)
- `PATCH /coupons/:couponId` - Update coupon (Admin)
- `DELETE /coupons/:couponId` - Delete coupon (Admin)

### Coupon Types:
- Percentage discounts (e.g., 20% off)
- Fixed amount discounts (e.g., ₹500 off)
- Max discount limit (for percentage coupons)
- Category-specific discounts
- Product-specific discounts

---

## 11. Notifications
**Endpoints:** `/api/v1/notifications/*`

### Features:
- In-app notifications
- Email notifications
- SMS notifications (setup ready)
- Notification center with filtering
- Mark as read functionality
- Notification history

### Notification Types:
- Order confirmation
- Order shipped
- Order delivered
- Payment received
- Product back in stock
- Promotional alerts
- Account alerts

### Key Endpoints:
- `GET /notifications` - Get user notifications (paginated)
- `GET /notifications/unread/count` - Get unread count
- `PATCH /notifications/:id/read` - Mark as read
- `PATCH /notifications/read/all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification
- `DELETE /notifications` - Delete all notifications

---

## 12. Admin Dashboard
**Endpoints:** `/api/v1/admin/*`

### Features:
- Dashboard statistics
- User management
- Sales reports
- Inventory management
- Top products analysis
- Order status monitoring

### Dashboard Metrics:
- Total users, products, orders
- Total revenue
- Orders by status
- Recent orders
- Low stock alerts
- Top selling products

### Key Endpoints:
- `GET /admin/dashboard` - Get dashboard stats
- `GET /admin/users` - Get all users (paginated)
- `PATCH /admin/users/:userId/role` - Change user role
- `DELETE /admin/users/:userId` - Delete user
- `GET /admin/sales-report` - Get sales data
- `GET /admin/top-products` - Get top products
- `GET /admin/inventory` - Get inventory status

### Admin Features:
- User management (create, read, update, delete, role assignment)
- Product management
- Order management
- Sales analytics
- Inventory tracking
- Customer insights

---

## 13. Email Notifications Service
**Service:** `/services/email.service.js`

### Features:
- Nodemailer integration
- HTML email templates
- Order confirmation emails
- Order shipment notifications
- Password reset emails
- Marketing emails

### Supported Templates:
- Order confirmation
- Order shipped
- Password reset
- Custom email template support

### Configuration:
Set these environment variables:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## Security Features

### Authentication & Authorization:
- JWT-based authentication
- Role-based access control
- Protected routes
- Password hashing with bcrypt

### API Security:
- CORS enabled
- Helmet for HTTP headers security
- Rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- SQL injection protection

### Data Security:
- Never expose passwords in responses
- Refresh token rotation
- Secure cookie handling

---

## API Documentation

### Swagger/OpenAPI:
Visit `http://localhost:5000/api-docs` to view the interactive API documentation.

All endpoints are documented with:
- Request/response schemas
- Authentication requirements
- Parameter descriptions
- Example requests

---

## Error Handling

All errors return consistent format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "data": null
}
```

---

## Pagination

List endpoints support pagination:
```
GET /endpoint?page=1&limit=10
```

Response includes:
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## Rate Limiting

- **Global limit:** 100 requests per 15 minutes per IP
- Applied to: `/api/*` endpoints
- Returns: `429 Too Many Requests`

---

## Database Models

### User
- Email (unique)
- Password (hashed)
- First name, Last name
- Role (user, admin)
- Timestamps

### Product
- Name, Description
- Price, Discount price
- Category
- Stock
- Images (Cloudinary)
- Ratings, Reviews count
- Featured flag
- Timestamps

### Order
- User reference
- Order items (product, quantity, price)
- Shipping address
- Order status
- Total amount
- Payment status
- Timestamps

### UserProfile
- User reference
- Phone number
- Date of birth, Gender
- Profile image
- Multiple addresses
- Preferences
- Timestamps

### Coupon
- Code (unique)
- Discount type (percentage, fixed)
- Discount value
- Usage limits
- Valid date range
- Category/Product specific
- Used by tracking
- Timestamps

### Notification
- User reference
- Type
- Message, Title
- Channel (email, in_app, SMS)
- Status (sent, failed, pending)
- Related entity reference
- Timestamps

---

## Best Practices

### Authentication:
1. Always include `Authorization: Bearer <token>` in headers
2. Tokens expire in 15 minutes
3. Use refresh token to get new access token
4. Store tokens securely in httpOnly cookies

### Filtering & Searching:
1. Use pagination for large datasets
2. Utilize text search for better UX
3. Filter by category, price, availability

### Error Handling:
1. Check `statusCode` for error types
2. Display `message` to users
3. Log errors for debugging
4. Retry on 5xx errors

---

## Future Enhancements

- [ ] Return/Refund management
- [ ] Advanced inventory forecasting
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Wishlist sharing
- [ ] Product recommendations
- [ ] Customer support chat
- [ ] Analytics dashboard
- [ ] Subscription products
- [ ] Multi-currency support

---

## Setup Instructions

### Prerequisites:
- Node.js v16+
- MongoDB
- Cloudinary account
- Razorpay account
- Gmail account (for email)

### Installation:
```bash
cd backend
npm install
```

### Configuration:
Copy `.env.example` to `.env` and fill in your details.

### Start Server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## Support

For API issues or questions, refer to:
- API Documentation: `http://localhost:5000/api-docs`
- Error messages for debugging
- Console logs in development

