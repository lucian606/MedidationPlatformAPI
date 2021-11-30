const Users = require('../models/Users.js');
const Reviews = require('../models/Review.js');

function createMessage(msg) {
    return {message : msg};
}

function deleteAllReviews() {
    Reviews.deleteMany({}, {});
    console.log("All reviews deleted");
}

async function getAllReviews() {
    let result = {code: 200, data : {}};
    try {
        let reviews = await Reviews.find({}, {_id: 0});
        result.data = reviews;
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting all reviews");
    }
    return result;
};

async function getReview(id) {
    let result = {code: 200, data : {}};
    try {
        let review = await Reviews.find({id: id}, {_id: 0});
        if (review == null || review == undefined || review.length == 0) {
            result.code = 404;
            result.data = createMessage("No review with the given id");
        } else {
            result.data = review;
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while getting the review with id");
    }
    return result;
}

async function addReview(reviewData) {
    let result = {code: 200, data : {}};

    try {
        let user_id = reviewData.user_id;
        let user = await Users.find({id: user_id});
        if (user == null || user == undefined || user.length == 0) {
            result.code = 404;
            result.data = createMessage("No user with the given id");
        } else {
            try {
                let newReview = await Reviews.create(reviewData);
                reviewData.id = newReview.id;
                let user_reviews = user[0].reviews;
                user_reviews.push(reviewData);
                let updatedReviews = {reviews: user_reviews};
                let updated_result = await Users.findOneAndUpdate({id : user_id}, {$set : updatedReviews}, {upsert : false, useFindAndModify: false, runValidators : true});
                result.code = 200;
                result.data = createMessage("Review added");
            } catch (err) {
                console.log(err);
                result.code = 400;
                result.data = createMessage("Invalid body");
            }
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while adding the review");
    }
    return result;
}

async function updateReview(id, message) {
    let result = {code: 200, data : {}};
    if (typeof message !== 'string') {
        result.code = 400;
        result.data = createMessage("Message must be string");
    } else {
        try {
            let review = await Reviews.find({id: id});
            if (review == null || review == undefined || review.length == 0) {
                result.code = 404;
                result.data = createMessage("No review with the given id");
            } else {
                let user_id = review[0].user_id;
                let user = await Users.find({id: user_id});
                let new_reviews = user[0].reviews.map(function(review) { 
                    if (review.id == id) {
                        review.message = message;
                    }
                    return review;
                });
                await Users.findOneAndUpdate({id: user_id}, {$set: {reviews: new_reviews}}, {upsert: false, useFindAndModify: false, runValidators: true});
                let updatedReview = await Reviews.findOneAndUpdate({id: id}, {message: message}, {upsert: false, useFindAndModify: false, runValidators: true});
                result.data = createMessage("Review updated");
            }
        } catch (err) {
            console.log(err);
            result.code = 500;
            result.data = createMessage("An error has occured while updating the review with id");
        }
    }
    return result;
}

async function deleteReview(id) {
    let result = {code: 200, data : {}};
    try {
        let review = await Reviews.find({id: id});
        let user_id = review[0].user_id;
        let user = await Users.find({id: user_id});
        console.log(user);
        let new_reviews = user[0].reviews.filter(review => review.id != id);
        await Users.findOneAndUpdate({id: user_id}, {$set: {reviews: new_reviews}}, {upsert: false, useFindAndModify: false, runValidators: true});
        let removeSuccess = await Reviews.deleteOne({id: id});
        if (removeSuccess.deletedCount == 0) {
            result.code = 404;
            result.data = createMessage("No review with the given id");
        } else {
            result.data = createMessage("Review deleted");
        }
    } catch (err) {
        console.log(err);
        result.code = 500;
        result.data = createMessage("An error has occured while deleting the review with id");
    }
    return result;
}

module.exports = { deleteAllReviews, getAllReviews, getReview, addReview, updateReview, deleteReview };