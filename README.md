# restaurant-api
A simplified, functional restaurant API made with MarbleJS, fp-ts, and PostgreSQL.

## Setup

Make sure `docker` and `docker-compose` are installed, and run:

```sh
git clone https://github.com/tam-carre/restaurant-api
cd restaurant-api
docker-compose up --build # depending on your docker install, you might have to run this as superuser/sudo
                          # if you wish to run it in the background, add the -d flag
```

## Features

Once the server is running, try for yourself the existing endpoints by running the following commands.
Output is included here for convenience.

```sh
# Utility function to make POST requests cleaner
$ req() {curl -X POST -H "Content-Type: application/json" -d "$2" -i "http://0.0.0.0:3000$1" }

# Let's create our first customer!
$ req '/customers/create' '{"name": "Maria", "email": "maria@gmail.com"}'
HTTP/1.1 200 OK

# What happens if we send invalid data, e.g. typo "email" as "mail"?
$ req '/customers/create' '{"name": "James", "mail": "james@yahoo.com"}'
HTTP/1.1 400 Bad Request
{"error":{"status":400,"message":"Validation error","data":[{"path":"email","expected":"string"}],"context":"body"}}%

# What happens if we try to create a user with an existing email?
$ req '/customers/create' '{"name": "Maria Magdalena", "email": "maria@gmail.com"}'
HTTP/1.1 400 Bad Request
Another customer has this email address.% 

# Let's create our first reservation!
$ req '/reservations/create' '{"customer": "maria@gmail.com", "restaurantTable": 1, "arrivalDate": "2021-08-30", "arrivalTime": "19:15:00"}'
HTTP/1.1 200 OK

# What happens if you try to reserve with a non-existent customer email?
$ req '/reservations/create' '{"customer": "non@existent.com", "restaurantTable": 2, "arrivalDate": "2021-08-30", "arrivalTime": "19:15:00"}'
HTTP/1.1 400 Bad Request
No customer with this email address was found.% 

# Seating time is 1 hour. What happens when you try to reserve a table that is already occupied?
$ req '/reservations/create' '{"customer": "maria@gmail.com", "restaurantTable": 1, "arrivalDate": "2021-08-30", "arrivalTime": "20:00:00"}'
HTTP/1.1 400 Bad Request
This table is not free at this time.% 

# What about reserving outside the opening hours of 19:00-24:00?
$ req '/reservations/create' '{"customer": "maria@gmail.com", "restaurantTable": 1, "arrivalDate": "2021-08-30", "arrivalTime": "15:00:00"}'
HTTP/1.1 400 Bad Request
The restaurant is closed at this time.%  

# What about reserving a non-existent table?
$ req '/reservations/create' '{"customer": "maria@gmail.com", "restaurantTable": 777, "arrivalDate": "2021-08-30", "arrivalTime": "15:00:00"}'
HTTP/1.1 400 Bad Request
Table 777 does not exist.% 

# Malformed data?
req '/reservations/create' '{"customer": "maria@gmail.com", "table": 1, "arrivalDate": "2021-08-30", "arrivalTime": "15:00:00"}'
HTTP/1.1 400 Bad Request
{"error":{"status":400,"message":"Validation error","data":[{"path":"restaurantTable","expected":"number"}],"context":"body"}}%

# OK, let's create a bunch of reservations so we can test the endpoint which lists them.
$ for ((i=1;i<=5;i++)); do req '/reservations/create' '{"customer": "maria@gmail.com", "restaurantTable": '$i', "arrivalDate": "2021-08-29", "arrivalTime": "19:00:00"}'; done

# Let's list reservations now.
$ req '/reservations/list' '{"fromDate": "2021-01-01", "toDate": "2022-12-01"}'
HTTP/1.1 200 OK
[{"id":1,"customer":"maria@gmail.com","name":"Maria","restaurantTable":1,"arrivalDate":"2021-08-30T00:00:00.000Z","arrivalTime":"19:15:00"},{"id":3,"customer":"maria@gmail.com","name":"Maria","restaurantTable":1,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"},{"id":4,"customer":"maria@gmail.com","name":"Maria","restaurantTable":2,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"},{"id":5,"customer":"maria@gmail.com","name":"Maria","restaurantTable":3,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"},{"id":6,"customer":"maria@gmail.com","name":"Maria","restaurantTable":4,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"},{"id":7,"customer":"maria@gmail.com","name":"Maria","restaurantTable":5,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"}]%  

# Pagination is implemented via offset and limit. Try this.
$ req '/reservations/list' '{"fromDate": "2021-01-01", "toDate": "2022-12-01", "limit": 2}'
HTTP/1.1 200 OK
[{"id":1,"customer":"maria@gmail.com","name":"Maria","restaurantTable":1,"arrivalDate":"2021-08-30T00:00:00.000Z","arrivalTime":"19:15:00"},{"id":3,"customer":"maria@gmail.com","name":"Maria","restaurantTable":1,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"}]%  

$ req '/reservations/list' '{"fromDate": "2021-01-01", "toDate": "2022-12-01", "limit": 2, "offset": 2}'
HTTP/1.1 200 OK
[{"id":4,"customer":"maria@gmail.com","name":"Maria","restaurantTable":2,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"},{"id":5,"customer":"maria@gmail.com","name":"Maria","restaurantTable":3,"arrivalDate":"2021-08-29T00:00:00.000Z","arrivalTime":"19:00:00"}]% 
```
