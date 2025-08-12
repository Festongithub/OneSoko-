# OneSoko Frontend

A modern React-based e-commerce platform that connects customers with local shops and businesses. Built with TypeScript, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

### Customer Journey
- **Landing Page**: Discover featured shops and popular products
- **Product Discovery**: Advanced search, filtering, and category browsing
- **Product Details**: Comprehensive product information with reviews and ratings
- **Shopping Cart**: Add items, manage quantities, and proceed to checkout
- **Order Management**: Track orders and view purchase history
- **Messaging**: Direct communication with shop owners

### Key Features
- 🛍️ **Shopping Cart**: Persistent cart with real-time updates
- ❤️ **Wishlist**: Save favorite products for later
- 🔍 **Advanced Search**: Filter by category, price, rating, and location
- 📱 **Responsive Design**: Mobile-first approach with touch-friendly interface
- 🔐 **Authentication**: JWT-based authentication with secure token management
- 💬 **Real-time Messaging**: Direct communication with shop owners
- 📊 **Product Reviews**: Customer ratings and feedback system

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **UI Components**: Headless UI + Heroicons
- **Form Handling**: React Hook Form
- **Build Tool**: Create React App

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onesoko-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── products/       # Product-related components
│   ├── cart/           # Shopping cart components
│   └── ui/             # Generic UI components
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── ProductDetails.tsx
│   ├── ProductSearch.tsx
│   ├── ShopProfile.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   └── Messages.tsx
├── store/              # Redux store configuration
│   ├── index.ts
│   └── cartSlice.ts
├── services/           # API services
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── assets/             # Static assets
```

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (`#0ea5e9` to `#3b82f6`)
- **Secondary**: Purple (`#d946ef`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: Product cards, shop cards, and content cards
- **Forms**: Input fields, select dropdowns, and validation
- **Navigation**: Header, sidebar, and breadcrumbs

## 🔌 API Integration

The frontend integrates with the OneSoko Django backend API:

### Authentication
- JWT token-based authentication
- Automatic token refresh
- Protected routes and components

### Key Endpoints
- `/api/products/` - Product management
- `/api/shops/` - Shop information
- `/api/orders/` - Order processing
- `/api/messages/` - Messaging system
- `/api/wishlists/` - Wishlist management

## 🚀 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Features

- JWT token authentication
- Secure API communication
- Input validation and sanitization
- Protected routes and components
- CSRF protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Building for Production

```bash
# Create production build
npm run build

# Serve production build locally
npx serve -s build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with customer journey features
- **v1.1.0** - Added shop owner features (planned)
- **v1.2.0** - Enhanced messaging and notifications (planned)

---

Built with ❤️ for the OneSoko community 