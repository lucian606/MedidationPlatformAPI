const Users = require('../models/Users.js');
const Reviews = require('../models/Review.js');
const { getAllUsers, getUserWithId, deleteUser, registerUser, loginUser, updateUser} = require('./UsersApi.js');
import * as demo from 'UsersApi.js';

function createMessage(msg) {
    console.log(getUserWithId)
    return {message : msg};
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
        let user = await getUserWithId(user_id);
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

async function updateReview(id, review) {
}

async function deleteReview(id) {
    let result = {code: 200, data : {}};
    try {
        let removeSuccess = await Reviews.deleteOne({id: id});
        console.log(removeSuccess);
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

module.exports = { getAllReviews, getReview, addReview, updateReview, deleteReview };