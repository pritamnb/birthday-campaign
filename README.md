# Birthday Campaign API

## Overview
This project implements a birthday campaign system using NestJS, TypeScript, MongoDB, and Docker. The system sends personalized discount emails to users before their birthdays and displays recommended products when they log into the app during their birthday week.

## Architecture diagram

![Performance Report](/architecture.png)


## Tech Stack
- **NestJS** (Backend Framework)
- **TypeScript** (Typed JavaScript)
- **MongoDB** (Database)
- **Mongoose** (Database ORM)
- **Docker & Docker Compose** (Containerization)
- **NodeMailer : email notifications**

- **Swagger** (API Documentation)

## Installation
### Prerequisites
- Node.js (>=18.x)
- Docker & Docker Compose
- MongoDB

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/pritamnb/birthday-campaign
   cd birthday-campaign
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start MongoDB and the application using Docker Compose:
   ```sh
   docker-compose up --build
   ```
4. Run the application locally:
   ```sh
   npm run start:dev
   ```

## API Documentation
Swagger documentation is available at:
```
http://localhost:3000/api
```

## API Endpoints
### User
- **Create User** `POST /api/user`
- **Get User by ID** `GET /api/user/:id`
- **Get Product Suggestions** `GET /api/user/:id/suggestions`

** Returns list of users who has their birthdays in this week.
- **Get Eligible Users** `GET /api/user`

### Discount
- **Redeem Code** `GET /api/discount/redeem/:userId/:code`
- **Check Code Availability** `GET /api/discount/available/:userId`


### Schema explanation
## User schema 

*Fields Explanation*

   - name: User's full name.

   - email: Unique email address (used for login and communications).

   - birthdate: Used for birthday-based discounts.

   - preferences: Stores user interests/categories.

   - discountGenerated: Tracks whether a birthday discount has been issued.

   - notificationSent: Tracks whether the user has been notified.

*Indexes Used*

   - email is unique to prevent duplicate user entries.



## Discount Schema 

*Fields Explanation*

   - userId: References the user who receives the discount.

   - code: Unique discount code (indexed due to unique: true).

   - used: Boolean flag to track whether the discount has been redeemed.

   - issuedAt: Timestamp when the discount was generated.

   - isExpired: Boolean flag indicating if the discount is expired.

*Indexes Used*

   - code is marked as unique to prevent duplicate discount codes.


## Product Schema 

*Fields Explanation*

   - name: Name of the product.

   - category: The category the product belongs to.

   - used: Boolean flag to track whether the discount has been redeemed.

   - rating: A rating between 0 and 5.

*Indexes Used*

   - code is marked as unique to prevent duplicate discount codes.

## Advantages using indexes

   - Fast lookups when filtering products by category.
   - Allows case-insensitive search for categories.
   - Efficient sorting and querying in e-commerce use cases.

## Security Considerations
- Only one time code is generated for the user and used only once
- Only one notification will be sent to the user at the start of the week from their birthday
- Once the code is used, the user won't be able to use it again
- Suggestions of the product will be given to the user based on their preferences
- If user's birthday passed then the discount code used/ unused will expires.

