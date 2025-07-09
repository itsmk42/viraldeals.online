# ViralDeals.online - Indian E-commerce Platform

A minimalist, fast-performing e-commerce platform built specifically for the Indian market using the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### Core E-commerce Features
- Clean, minimalist UI with mobile-first responsive design
- Product catalog with categories and filtering
- Shopping cart and streamlined checkout process
- User authentication and account management
- Order tracking and history

### India-Specific Features
- **Payment Integration**: UPI, Credit/Debit Cards, Net Banking, Digital Wallets
- **Currency**: All prices displayed in Indian Rupees (INR)
- **Taxation**: GST calculation and display
- **Shipping**: Order tracking with courier integration support

### Admin Features
- Secure admin dashboard
- Product management (CRUD operations)
- Order management and status updates
- User management
- Sales analytics

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling and responsive design
- **React Router** - Navigation
- **Axios** - API communication
- **React Hook Form** - Form handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
viraldeals.online/
├── backend/          # Node.js/Express API
├── frontend/         # React application
└── README.md         # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd viraldeals.online
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
```bash
# In backend directory, create .env file
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/viraldeals
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## API Documentation

The API endpoints will be documented here as development progresses.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
