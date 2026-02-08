-- DVD Rental Semantic Metadata
-- Run this in Supabase to provide context for the AI Assistant

-- Actor
COMMENT ON TABLE actor IS 'List of actors involved in the films.';
COMMENT ON COLUMN actor.actor_id IS 'Unique identifier for each actor.';
COMMENT ON COLUMN actor.first_name IS 'First name of the actor.';
COMMENT ON COLUMN actor.last_name IS 'Last name of the actor.';

-- Category
COMMENT ON TABLE category IS 'Categories or genres of films (e.g., Action, Comedy, Sci-Fi).';
COMMENT ON COLUMN category.name IS 'The name of the category.';

-- Film
COMMENT ON TABLE film IS 'Comprehensive list of films available for rent.';
COMMENT ON COLUMN film.title IS 'The title of the film.';
COMMENT ON COLUMN film.description IS 'A brief summary of the film plot.';
COMMENT ON COLUMN film.release_year IS 'The year the film was released.';
COMMENT ON COLUMN film.rental_duration IS 'The allowed length of rental in days.';
COMMENT ON COLUMN film.rental_rate IS 'The cost to rent the film for the rental duration.';
COMMENT ON COLUMN film.replacement_cost IS 'The amount charged if the film is lost or damaged.';
COMMENT ON COLUMN film.rating IS 'The MPAA rating of the film (G, PG, PG-13, R, NC-17).';
COMMENT ON COLUMN film.special_features IS 'Extra features available on the DVD (e.g., Deleted Scenes, Trailers).';

-- Customer
COMMENT ON TABLE customer IS 'Registered customers who rent films.';
COMMENT ON COLUMN customer.first_name IS 'First name of the customer.';
COMMENT ON COLUMN customer.last_name IS 'Last name of the customer.';
COMMENT ON COLUMN customer.email IS 'Email address used for communication and receipts.';
COMMENT ON COLUMN customer.activebool IS 'Whether the customer is currently active.';
COMMENT ON COLUMN customer.create_date IS 'The date the customer record was created.';

-- Inventory
COMMENT ON TABLE inventory IS 'Tracks individual physical copies of films at specific stores.';
COMMENT ON COLUMN inventory.inventory_id IS 'Unique ID for a specific physical copy of a film.';

-- Rental
COMMENT ON TABLE rental IS 'Records of every film rental transaction.';
COMMENT ON COLUMN rental.rental_date IS 'The date and time the film was checked out.';
COMMENT ON COLUMN rental.return_date IS 'The date and time the film was returned.';

-- Payment
COMMENT ON TABLE payment IS 'Financial transactions for rentals.';
COMMENT ON COLUMN payment.amount IS 'The amount of the payment.';
COMMENT ON COLUMN payment.payment_date IS 'The date and time the payment was processed.';

-- Staff
COMMENT ON TABLE staff IS 'Employees at the rental stores.';
COMMENT ON COLUMN staff.username IS 'The username used for login.';

-- Store
COMMENT ON TABLE store IS 'The physical rental locations.';

-- Address/Location
COMMENT ON TABLE address IS 'Physical addresses for customers, staff, and stores.';
COMMENT ON TABLE city IS 'City names linked to addresses.';
COMMENT ON TABLE country IS 'Country names linked to cities.';
