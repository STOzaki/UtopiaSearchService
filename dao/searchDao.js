const db = require('./db');
const classFilterFunction = require('../util/classFilter');
const seatFilterFunction = require('../util/seatFilter');
const departureDateFunction = require('../util/departureDateFilter');
const arrivalDateFunction = require('../util/arrivalDateFilter');

let sqliteDatabase;
if(process.env.NODE_ENV === 'test') {sqliteDatabase = require('better-sqlite3');}

exports.getAll = function(filter, cb) {
    // get class filter
    const classFilter = classFilterFunction.classFilter(filter.class, db);
    // get seat filter
    const seatFilter = seatFilterFunction.seatFilter(filter.seat, db);
    // get departure date filter
    const departureDateFilter = departureDateFunction.departureDateFilter(filter.departureDateAfter, filter.departureDateBefore, db);
    // get arrival date filter
    const arrivalDateFilter = arrivalDateFunction.arrivalDateFilter(filter.arrivalDateAfter, filter.arrivalDateBefore, db);

    // filter to be used on sql query
    let departureLocationFilter = '';
    let departureLocationArray = null;
    // still in string form after getting passed as a query parameter
    // if there is something the departure_location object
    if(filter.departure_location) {departureLocationArray = filter.departure_location.split(',');}

    if(Array.isArray(departureLocationArray)) {
        let i;
        let departureLocationLength = departureLocationArray.length;
        let sqldepartureLocationList = '';
        for (i = 0; i < departureLocationLength; i++) {
            let comma = ',';
            // last element will not have a comma after it
            if(i === departureLocationLength - 1) {comma = '';}
            sqldepartureLocationList = sqldepartureLocationList + db.escape(departureLocationArray[i]) + comma;
        }
        departureLocationFilter = ' AND departure IN (' + sqldepartureLocationList + ')';
    }

    // filter to be used on sql query
    let destinationLocationFilter = '';
    let destinationLocationArray = null;
    // still in string form after getting passed as a query parameter
    // if there is something the destination_location object
    if(filter.destination_location) {destinationLocationArray = filter.destination_location.split(',');}

    if(Array.isArray(destinationLocationArray)) {
        let i;
        let destinationLocationLength = destinationLocationArray.length;
        let sqldestinationLocationList = '';
        for (i = 0; i < destinationLocationLength; i++) {
            let comma = ',';
            // last element will not have a comma after it
            if(i === destinationLocationLength - 1) {comma = '';}
            sqldestinationLocationList = sqldestinationLocationList + db.escape(destinationLocationArray[i]) + comma;
        }
        destinationLocationFilter = ' AND destination IN (' + sqldestinationLocationList + ')';
    }

    let sqlQuery = 'SELECT flight, seat_row, seat, class, reserver, price, reservation_timeout, booking_id, departure, destination, departure_date, arrival_date, flight_number FROM tbl_tickets AS t LEFT JOIN tbl_flights AS f ON t.flight = f.id WHERE reserver IS NULL' + classFilter +
        seatFilter + departureDateFilter + arrivalDateFilter + departureLocationFilter + destinationLocationFilter + ';';

    if(process.env.NODE_ENV === 'test') {
        // Please look at the README for debugging to the console
        const Testdb = new sqliteDatabase('airlinesTest.db', {memory: true});
        const result = Testdb.prepare(sqlQuery).all();
        cb(null, result);
    } else {
        // filter out reserver by default because we want tickets that have not been taken yet
        db.query(sqlQuery,cb);
    }
};