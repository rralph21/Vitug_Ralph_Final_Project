# Back End Development - Final Project

REST API for a medical appointment system. The API allows users to create, read, update, and delete appointments, as well as manage patient and doctor information. 
The API is built using Node.js and Express, and it uses Firebase and Firestore for data management and authentication. 
The API includes endpoints for managing appointments, patients, and doctors, 
as well as authentication and authorization features to ensure that only authorized 
users can access certain endpoints. 
The API also includes error handling and validation to ensure that the data being sent
to the server is valid and that any errors are properly handled and returned to the client.


## Features
- Create, read, update, and delete appointments
- Manage patient and doctor information
- Authentication and authorization
- Error handling and validation

## Technologies Used
- Node.js
- Express
- Firebase Authentication
- JSON Web Tokens (JWT)

## How the API Works

```
Request → Route Handler → Validation Middleware → Controller → 
Service → Repository → Database → Response
```

## Key Features

- **Input Validation**: All incoming data is validated before
  processing using Joi
- **Clean Architecture**: Organized code structure for easy
  maintenance
- **Error Handling**: Consistent error responses
- **Logging**: Request logging with Morgan
- **Firebase Integration**: Secure backend database
- **TypeScript**: Type-safe code for fewer bugs


## Security

- Input validation prevents malicious data
- Error messages don't expose sensitive information
- Firebase security rules protect your database
- Helmet.js sets secure HTTP headers
- CORS is configured to allow only trusted origins
- Environment variables are used for sensitive information
- Morgan logs requests for monitoring and debugging


## Conclusion
This API provides a robust and secure backend for a medical appointment system, allowing for efficient management of appointments, patients, and doctors. 
With features like authentication, validation, and error handling, it ensures a reliable and user-friendly experience for both patients and healthcare providers.

## Version 1.0.1

## New component and integration

# Observer pattern integration

- observer pattern is a pattern that allows an object, called the subject, 
to maintain a list of its dependents, called observers, and notify them of any state changes, 
usually by calling one of their methods.

- In this project, the observer pattern is used to notify the doctor when a new appointment is created. 
When a patient creates a new appointment, the doctor is notified of the new appointment and can take appropriate action, 
such as confirming the appointment or rescheduling it. Additionally, patients can also be notified of any changes to their 
appointments, such as cancellations or rescheduling, through the observer pattern.

# resources

- refactoring.guru/design-patterns/observer


# Author

Ralph Vitug
