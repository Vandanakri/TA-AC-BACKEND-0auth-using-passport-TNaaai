var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var URLSlug = require('mongoose-slug-generator');
mongoose.plugin(URLSlug);

var blogSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  likes: { type: Number, default: 0 },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  author: { type: String },
  slug: {
    type: String,
    unique: true,
    slug: 'title',
  },
});

blogSchema.pre('save', function (next) {
  this.slug = this.title.split(' ').join('-');
  next();
});

module.exports = mongoose.model('Blog', blogSchema);