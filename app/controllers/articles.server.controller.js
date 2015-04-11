'use strict';
/**
 * Module dependencies.
 */
var db = require('../../config/sequelize');

/**
 * Create a article
 */
exports.create = function(req, res) {
	// augment the article by adding the UserId
	req.body.UserId = req.user.id;
	// save and return and instance of article on the res object.
	db.Article.create(req.body).success(function(article){
		if(!article){
			return res.send('users/signup', {errors: err});
		} else {
			return res.jsonp(article);
		}
	}).error(function(err){
		return res.send('users/signup', {
			errors: err,
			status: 500
		});
	});

};

/**
 * Show the current article
 */
exports.read = function(req, res) {
	res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function(req, res) {
	var article = req.article;

	article.updateAttributes({
		title: req.body.title,
		content: req.body.content
	}).success(function(a){
		return res.jsonp(a);
	}).error(function(err){
		return res.render('error', {
			error: err,
			status: 500
		});
	});
};

/**
 * Delete an article
 */
exports.delete = function(req, res) {
	// create a new variable to hold the article that was placed on the req object.
	var article = req.article;

	article.destroy().success(function(){
		return res.jsonp(article);
	}).error(function(err){
		return res.render('error', {
			error: err,
			status: 500
		});
	});
};

/**
 * List of Articles
 */
exports.list = function(req, res) {
	db.Article.findAll({include: [db.User]}).success(function(articles){
		return res.jsonp(articles);
	}).error(function(err){
		return res.render('error', {
			error: err,
			status: 500
		});
	});
};
exports.show = function(req, res) {
	// Sending down the article that was just preloaded by the articles.article function
	// and saves article on the req object.
	return res.jsonp(req.article);
};
/**
 * Article middleware
 */
exports.articleByID = function(req, res, next, id) {

	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).send({
			message: 'Article is invalid'
		});
	}

	Article.findById(id).populate('user', 'displayName').exec(function(err, article) {
		if (err) return next(err);
		if (!article) {
			return res.status(404).send({
				message: 'Article not found'
			});
		}
		req.article = article;
		next();
	});
};

/**
 * Article authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.article.user.id !== req.user.id) {
		return res.status(403).send({
			message: 'User is not authorized'
		});
	}
	next();
};
