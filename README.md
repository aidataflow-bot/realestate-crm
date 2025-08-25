# Real Estate CRM System

A comprehensive, full-stack Customer Relationship Management system designed specifically for real estate professionals. Built with modern technologies including React, TypeScript, Node.js, and PostgreSQL.

## 🌟 Features

- **Client Management**: Complete client profiles with contact information, preferences, and lifecycle tracking
- **Transaction Management**: Track property deals, commissions, and transaction status
- **Dashboard Analytics**: Visual reports and statistics for business insights
- **Secure Authentication**: JWT-based authentication system
- **Responsive Design**: Modern, mobile-friendly interface
- **Real-time Updates**: Live data updates across the application

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- **Tailwind-inspired** styling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** database
- **JWT** authentication
- **Zod** for input validation

### Security & Performance
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **CORS** configuration
- **Input validation** and sanitization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/realestate-crm.git
   cd realestate-crm
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your database URL and JWT secret in .env
   npx prisma migrate dev
   npx prisma db seed
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**
   ```bash
   # Backend (runs on port 3001)
   cd backend && npm run dev
   
   # Frontend (runs on port 5173)
   cd frontend && npm run dev
   ```

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/realestate_crm"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## 📱 Demo Account

You can test the system with the following demo account:

- **Email**: rodrigo@realtor.com  
- **Password**: admin123

## 🗄 Database Schema

The system uses three main entities:

- **Users**: Authentication and user management
- **Clients**: Real estate clients with contact info, preferences, and lifecycle stages
- **Transactions**: Property deals with commission tracking and status management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Clients
- `GET /api/clients` - List clients with pagination and search
- `GET /api/clients/:id` - Get client details
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🚀 Deployment

### Vercel Deployment

This project is configured for easy deployment on Vercel:

1. **Connect to Vercel**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the configuration

2. **Environment Variables**
   Set the following environment variables in Vercel:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

3. **Database Setup**
   - Set up a PostgreSQL database (recommended: Railway, Supabase, or Neon)
   - Run migrations: `npx prisma migrate deploy`
   - Seed data: `npx prisma db seed`

### Traditional Hosting

For traditional hosting, you can:

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the backend as a Node.js application
3. Serve the frontend static files
4. Configure your database and environment variables

## 🔒 Security Features

- JWT-based authentication
- Password encryption with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Security headers with Helmet.js

## 📊 Sample Data

The system comes with pre-populated sample data including:
- Demo user account
- Sample clients (buyers, sellers, investors)
- Transaction records with commission calculations
- Various client stages and tags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation for integration details

## 🎯 Roadmap

Future enhancements planned:
- Email integration and templates
- Advanced reporting and analytics
- Mobile app companion
- Third-party integrations (MLS, DocuSign, etc.)
- Multi-user team features
- Advanced property management

---

Built with ❤️ for real estate professionals who want to manage their business efficiently.

🚀 Last updated: August 25, 2025 - Vercel deployment ready!
