// pass in the arrival date after a certain date (optional) and before a certain date (optional),
// and the db connection (which includes the escape function)
module.exports.arrivalDateFilter = (arrivalDateAfter, arrivalDateBefore, db) => {
    // if the user wants to arrive anytime after `arrivalDateAfter`
    arrivalDateAfter = arrivalDateAfter ? db.escape(arrivalDateAfter) : '\'0000-00-00 00:00:00\'';

    // if the user wants to arrive anytime before `arrivalDateBefore`
    arrivalDateBefore = arrivalDateBefore ? db.escape(arrivalDateBefore) : '\'9999-12-31 23:59:59\'';

    if (arrivalDateAfter || arrivalDateBefore) {
        return ' AND arrival_date BETWEEN ' + arrivalDateAfter + ' AND ' + arrivalDateBefore;
    } else {
        return '';
    }
};