 1 => frontend
    ├── README.md
    ├── controllers
        ├── authController.js
        ├── reviewController.js
        ├── tourController.js
        └── userController.js
    ├── models
        ├── Review.js
        ├── Tour.js
        └── User.js
    ├── package-lock.json
    ├── package.json
    ├── public
        ├── index.html
        ├── logo192.png
        ├── logo512.png
        ├── manifest.json
        ├── robots.txt
        └── tour-images
        │   ├── corbett.jpg
        │   ├── har.jpg
        │   ├── har.webp
        │   ├── tour-img01.jpg
        │   ├── tour-img02.jpg
        │   ├── tour-img03.jpg
        │   ├── tour-img04.jpg
        │   ├── tour-img05.jpg
        │   ├── tour-img06.jpg
        │   ├── tour-img07.jpg
        │   ├── tour-img08.jpg
        │   ├── tour-img09.jpg
        │   ├── tour-img10.jpg
        │   ├── tour-imgh.jpg
        │   └── tour-imgk.jpg
    ├── routes
        ├── auth.js
        ├── reviews.js
        ├── tours.js
        └── users.js
    ├── src
        ├── App.css
        ├── App.js
        ├── assets
        │   ├── data
        │   │   ├── tours.js
        │   │   └── tours.json
        │   └── images
        │   │   ├── ava-1.jpg
        │   │   ├── ava-2.png
        │   │   ├── ava-3.png
        │   │   ├── avatar.jpg
        │   │   ├── customization.png
        │   │   ├── experience.png
        │   │   ├── gallery-01.jpg
        │   │   ├── gallery-02.jpg
        │   │   ├── gallery-03.jpg
        │   │   ├── gallery-04.jpg
        │   │   ├── gallery-05.jpg
        │   │   ├── gallery-06.jpg
        │   │   ├── gallery-07.jpg
        │   │   ├── guide.png
        │   │   ├── hero-img01.jpg
        │   │   ├── hero-img02.jpg
        │   │   ├── hero-video.mp4
        │   │   ├── login.png
        │   │   ├── logo.png
        │   │   ├── logo1.png
        │   │   ├── logo2.png
        │   │   ├── male-tourist.png
        │   │   ├── pexels-david-bartus-586687.jpg
        │   │   ├── register.png
        │   │   ├── tour-img01.jpg
        │   │   ├── tour-img02.jpg
        │   │   ├── tour-img03.jpg
        │   │   ├── tour-img04.jpg
        │   │   ├── tour-img05.jpg
        │   │   ├── tour-img06.jpg
        │   │   ├── tour-img07.jpg
        │   │   ├── tour-img08.jpg
        │   │   ├── tour-img09.jpg
        │   │   ├── tour-img10.jpg
        │   │   ├── tour.jpg
        │   │   ├── user.png
        │   │   ├── weather.png
        │   │   └── world.png
        ├── components
        │   ├── Booking
        │   │   ├── Booking.jsx
        │   │   └── booking.css
        │   ├── Featured-tours
        │   │   └── FeaturedTourList.jsx
        │   ├── Header
        │   │   ├── Header.jsx
        │   │   └── header.css
        │   ├── Testimonial
        │   │   └── Testimonials.jsx
        │   ├── footer
        │   │   ├── footer.css
        │   │   └── footer.jsx
        │   ├── image-gallery
        │   │   ├── MasonryImageGallery.jsx
        │   │   └── galleryImages.js
        │   └── layout
        │   │   └── Layout.js
        ├── context
        │   └── AuthConstext.js
        ├── hooks
        │   └── useFatch.js
        ├── index.js
        ├── pages
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── SearchResult.jsx
        │   ├── Thankyou.jsx
        │   ├── TourDetails.jsx
        │   ├── Tours.jsx
        │   ├── UttarakhandTour.jsx
        │   └── about.jsx
        ├── router
        │   └── Routers.js
        ├── services
        │   ├── Service-card.css
        │   ├── ServiceCard.jsx
        │   └── ServiceList.jsx
        ├── shared
        │   ├── CommonSection.jsx
        │   ├── Newsletter.jsx
        │   ├── SearchBar.jsx
        │   ├── Subtitle.jsx
        │   ├── TourCard.jsx
        │   ├── common-section.css
        │   ├── newsletter.css
        │   ├── search-bar.css
        │   └── tour-card.css
        ├── styles
        │   ├── about.css
        │   ├── home.css
        │   ├── login.css
        │   ├── thank-you.css
        │   ├── tour-details.css
        │   ├── tour.css
        │   └── uttrakhnad.css
        └── utils
        │   ├── avgRating.js
        │   └── config.js
    └── utils
        └── verifyToken.js








        
2 => ├── backend
    ├── controllers
    │   ├── authController.js
    │   ├── reviewController.js
    │   ├── tourController.js
    │   └── userController.js
    ├── index.js
    ├── models
    │   ├── Review.js
    │   ├── Tour.js
    │   └── User.js
    ├── package-lock.json
    ├── package.json
    ├── routes
    │   ├── auth.js
    │   ├── reviews.js
    │   ├── tours.js
    │   └── users.js
    ├── utils
    │   └── verifyToken.js
    └── vercel.json




Green contribution test from VS Code

## Admin dashboard

The admin dashboard is available at `/admin`, with administrator-only sign-in at `/admin/login`. The first administrator is created through `/admin/setup`; this one-time setup is disabled unless `ADMIN_SETUP_KEY` is configured on the backend, and it closes after an admin account exists.

1. In `backend/.env`, add a randomly generated `ADMIN_SETUP_KEY` of at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and keep it private.
2. Set `MONGO_URI`, `JWT_SECRET_KEY`, and `FRONTEND_URL` in the backend environment. `FRONTEND_URL` must be the exact website origin in production. Restart the backend and open `http://localhost:3000/admin/setup` (or your deployed frontend's `/admin/setup` URL).
3. Create the administrator, then sign in at `/admin/login`.

The dashboard currently provides database-backed overview analytics, booking status and internal-note management, tour CRUD, user search/edit/account activation/booking history, and review moderation. Admin APIs require the signed HTTP-only login cookie and enforce the admin role on the server. Passwords and password hashes are never returned by user APIs. Revenue includes only payment records verified by a provider; the current booking flow does not integrate an online payment provider.

The catalog also supports managed categories and destinations, coupons, enquiries, and CMS/site settings. About-page team members and home testimonials are editable through the CMS JSON editor. Admin sub-roles and multi-image file uploads are not implemented; tour galleries can be configured with image URLs.

## Traveler accounts and booking APIs

Travelers can manage their profile and booking requests at `/account`. The account page uses `GET /api/bookings/mine` for the signed-in user's history and `PATCH /api/bookings/:id/cancel` to cancel their own pending requests; confirmed or completed bookings require contacting the team. Booking and profile endpoints require the HTTP-only authentication cookie.

Tour discovery supports destination/title search, date and traveler availability, category, price, duration, rating, and sort filters. Newsletter sign-ups are stored through `POST /api/v1/newsletter/subscribe`; contact enquiries use `POST /api/v1/enquiries`.

For local development, run the API from `backend` and the website from `frontend`. Admin CRUD requires MongoDB to be connected; the sample tours shown when MongoDB is unavailable are read-only. Keep all backend environment values private and never place them in frontend code.
