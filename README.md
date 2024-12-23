# Todo List API

## Overview

A simple and effective Todo List API that enables users to manage their tasks efficiently. The API provides features such as user registration, login, password management (reset, forgot, and change), and CRUD operations on todos. Each todo contains the following fields:

-   **todo**: The task description.
-   **date**: The due date of the task.
-   **status**: The completion status of the task.

## Table of Contents

1. [Overview](#overview)
2. [Libraries and Tech Stack](#libraries-and-tech-stack)
3. [Getting Started](#getting-started)
    - [Clone the Project](#clone-the-project)
    - [Install npm Modules](#install-npm-modules)
    - [Configure Environment Variables](#configure-environment-variables)
    - [Start the Server](#start-the-server)
4. [Testing the Project](#testing-the-project)
5. [Social Links](#social-links)

## Libraries and Tech Stack

-   **Backend**: Node.js (Express.js)
-   **Database**: MongoDB
-   **Additional libraries**:
    -   Joi (Data Validation)
    -   JsonWebToken (Tokens used to login and reset password)
    -   Bcrypt (To store password securely in database by hashing)
    -   Cors (To allow other origin request to the API)
    -   Express-Rate-Limit (To prevent DOS kind of attack)
    -   Node Mailer (To send e-mail)
    -   Moment (To handle and modify dates easily)
    -   Mongoose (MongoDB ODM)

## Getting Started

### Clone the Project

```bash
git clone <repository-url>
cd <project-directory>
```

### Install npm Modules

```bash
npm install
```

### Configure Environment Variables

1. Open the `.env.sample` file in the root directory.
2. Replace the placeholder values with your own configuration (e.g., database URL, JWT secret, etc.).
3. Rename `.env.sample` to `.env`:
    ```bash
    mv .env.sample .env
    ```

### Start the Server

Run the following command to start the server:

```bash
npm start
```

## Testing the Project

You can use Postman to test the APIs:

1. Manually enter the API endpoints.
2. Configure request headers, body, or query parameters as needed.
3. Send requests and verify the responses.

## Social Links

Feel free to connect with me:

-   **Instagram**: [@rahul.coder](https://www.instagram.com/rahul.coder/)
-   **LinkedIn**: [Rahul Agarwal](https://linkedin.com/in/rahul-agarwal12)
-   **Email**: [imagarwal05@gmail.com](mailto:imagarwal05@gmail.com)
-   **YouTube**: [@rahul.coder12](https://www.youtube.com/@rahul.coder12)
-   **GitHub**: [@imRahulAgarwal](https://github.com/imRahulAgarwal)
