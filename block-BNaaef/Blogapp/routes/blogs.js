  var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Blog = require('../models/Blog');
var Comment = require('../models/Comment');
var User = require('../models/User');

// Route for adding blog

router.get('/new', (req, res, next) => {
  res.render('addBlog');
});

// Getting data from form and storing in database

router.post('/new', (req, res, next) => {
  Blog.create(req.body, (err, blog) => {
    res.redirect('/blogs');
  });
});

// Showing data from database

router.get('/', (req, res, next) => {
  Blog.find({}, (err, blog) => {
    if (err) return next(err);
    res.render('users', { blog: blog });
  });
});

// Showing individual blog

router.get('/:slug', (req, res, next) => {
  var slug = req.params.slug;
  Blog.findOne({ slug: slug })
    .populate('comments')
    .exec((err, blog) => {
      if (err) return next(err);
      res.render('blogDetail', { blog });
    });
});

// Updating single blog route

router.get('/:slug/edit', (req, res, next) => {
  var slug = req.params.slug;
  Blog.findOne({ slug: slug }, (err, blog) => {
    if (err) return next(err);
    res.render('updateBlog', { blog: blog });
  });
});

router.post('/:slug', (req, res, next) => {
  var slug = req.params.slug;
  Blog.findOneAndUpdate(
    { slug: slug },
    req.body,
    { new: true },
    (err, updatedBlog) => {
      if (err) return next(err);
      res.redirect('/blogs/' + slug);
    }
  );
});

// Delete Route

router.get('/:slug/delete', (req, res, next) => {
  var slug = req.params.slug;
  Blog.findOneAndDelete(slug, (err, deletedBlog) => {
    if (err) return next(err);
    res.redirect('/blogs');
  });
});

// Like Route

router.get('/:slug/likes', async (req, res, next) => {
  var slug = req.params.slug;
  try {
    const articleLikes = await Blog.findOneAndUpdate(
      { slug: slug },
      { $inc: { likes: 1 } }
    );
    res.redirect('/blogs/' + slug);
  } catch (err) {
    return next(err);
  }
});

// Dislike Route

router.get('/:slug/dislike', (req, res, next) => {
  var slug = req.params.slug;
  var dislike = req.body.likes;
  Blog.findOne({ slug: slug }, (err, blog) => {
    if (err) return next(err);
    if (blog.likes === 0) {
      Blog.findOneAndUpdate({ slug: slug }, { likes: 0 }, (err, articles) => {
        if (err) return next(err);
        res.redirect('/blogs/' + slug);
      });
    } else {
      Blog.findOneAndUpdate(
        { slug: slug },
        { $inc: { likes: -1 } },
        (err, blog) => {
          if (err) return next(err);
          res.redirect('/blogs/' + slug);
        }
      );
    }
  });
});

// Comments

// Displaying Comments

router.post('/:slug/comments', (req, res, next) => {
  var slug = req.params.slug;
  Blog.findOne({ slug: slug }, (err, blog) => {
    console.log(blog);
    if (err) return next(err);
    var blogId = blog._id;
    Comment.create(req.body, (err, comment) => {
      console.log(comment);
      if (err) return next(err);
      Blog.findByIdAndUpdate(
        blogId,
        { $push: { comments: comment._id } },
        (err, blog) => {
          console.log(blog);
          if (err) return next(err);
          res.redirect('/blogs/' + blog.slug);
        }
      );
    });
  });
});

// Updating Comment

router.get('/:slug/:id/edit', (req, res, next) => {
  var slug = req.params.slug;
  var id = req.params.id;
  Comment.findById(id, (err, comment) => {
    if (err) return next();
    res.render('updateComment', { comment, slug });
  });
});

router.post('/:slug/:id', (req, res, next) => {
  var slug = req.params.slug;
  var id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body, (err, updatedComment) => {
    if (err) return next(err);
    res.redirect('/blogs/' + slug);
  });
});

// Deleting Comments

router.get('/:slug/:id/delete', (req, res, next) => {
  var slug = req.params.slug;
  var commentId = req.params.id;
  Comment.findByIdAndDelete(commentId, (err, deletedComment) => {
    if (err) return next(err);
    res.redirect('/blogs/' + slug);
  });
});

// Liking Comment

router.get('/:slug/:id/likes', async (req, res, next) => {
  var slug = req.params.slug;
  var id = req.params.id;
  try {
    const articleLikes = await Comment.findByIdAndUpdate(id, {
      $inc: { likes: 1 },
    });
    res.redirect('/blogs/' + slug);
  } catch (err) {
    return next(err);
  }
});

router.get('/:slug/:id/dislike', (req, res, next) => {
  var slug = req.params.slug;
  var id = req.params.id;
  var dislike = req.body.likes;
  var counter = dislike === 'likes' ? 1 : -1;
  Comment.findByIdAndUpdate(
    id,
    { $inc: { likes: counter } },
    (err, articles) => {
      if (err) return next(err);
      res.redirect('/blogs/' + slug);
    }
  );
});

module.exports = router;