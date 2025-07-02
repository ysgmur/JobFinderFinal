# JobFinderFinal

## Project Overview

JobFinderFinal is a full-stack job search platform that allows users to search, filter, and apply for job listings, create job alerts, and interact with an AI agent to assist their job search.

The application consists of a React frontend deployed on Vercel and a Flask backend deployed on Render, connected via RESTful APIs.

---

## Deployed URLs

- **Frontend URL:** [https://job-finder-final.vercel.app/](https://job-finder-final.vercel.app/)
- **Backend API URL:** [https://jobfinderfinal.onrender.com](https://jobfinderfinal.onrender.com)
- **Short Video URL:** https://drive.google.com/file/d/1pVTS-lqvWuRlUfPd70aWm39EO-iiyYXt/view?usp=sharing

---

## Design & Assumptions

### Design

- Frontend built with React and Vite for fast development and deployment.
- Backend built with Flask REST API, secured with JWT authentication.
- MongoDB Atlas as the database service for storing users, jobs, alerts, and search history.
- API base URLs managed through environment variables for easy configuration between local and production environments.
- Dockerized backend and frontend for containerized deployment during development (optional).

### Assumptions

- Users must register and login to apply for jobs and create alerts.
- Admin users can add and update job postings.
- The AI agent helps users by providing job suggestions based on prompts.
- Notifications feature informs users of relevant job postings or alerts.

---

## Issues Encountered

- Initial confusion over environment variable handling in Vite and React.
- API CORS issues resolved using Flask-CORS.
- Deployment errors due to incorrect build output directory in Vercel fixed by setting correct build path.
- Ensuring consistent URLs between frontend and backend required careful environment variable management.
- Debugging JWT token expiration and unauthorized access flows.

---
## Data Models

1. User
Stores user information.

Fields:

id: Unique user identifier (UUID).

username: Unique username in the system.

email: User's email address.

password: Hashed password.

is_admin: Boolean indicating whether the user has admin privileges.

2. Job
Contains job listing details.

Fields:

id: Unique job listing identifier.

title: Job position title.

company: Company name.

description: Description of the job.

city, district, country: Location details of the job.

work_type: Type of work (remote, full-time, part-time, etc.).

application_count: Number of applications received for the job.

3. Alert
Stores job alerts created by users.

Fields:

id: Unique alert identifier.

user_id: The ID of the user who created the alert.

keyword: Position keyword to search for.

city: Optional city filter for the alert.

4. Notification
Notifications sent to users about jobs or alerts.

Fields:

id: Notification identifier.

user_id: The user receiving the notification.

type: Type of notification (alert, suggestion, etc.).

jobs: List of job IDs related to the notification.

timestamp: Creation time of the notification.

5. Search History
Records of the searches users have performed.

Fields:

id: Search record identifier.

user_id: The user who made the search.

keyword: The keyword searched for.

city: The city used in the search.

timestamp: Time of the search.

---

## Current Status and Known Issues
Please note that this project is still under active development and some functionalities may not work as expected. Due to time constraints and development challenges, not all features are fully implemented or free of bugs at this stage.

Some core functions such as user registration, login, job posting, and alerts may experience errors or incomplete behavior.

API responses occasionally return errors or timeouts.

Frontend components might not always handle backend errors gracefully.

Authentication and session management need further refinement for stability.

AI agent functionality is in a prototype phase and may not always provide relevant suggestions.

---
