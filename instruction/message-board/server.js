let express = require('express');
let bp = require('body-parser');
let mongoose = require('mongoose');

let app = express();

//setup middleware
app.use(express.static(__dirname + '/static'))
app.use(bp.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//overwrite mongoose promise library with the JS promise library
mongoose.Promise = global.Promise;

//connect to the database
mongoose.connect('mongodb://localhost/messageboard23048', { useMongoClient: true });

//Schemas
//Message schema
let MessageSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name cannot be blank'],
		minlength: [4, 'Name must be at least four characters']
	},
	message: {
		type: String,
		required: [true, 'Message cannot be blank']
	},
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Comment'
	}]
}, { timestamps: true });

//Comment schema
let CommentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Name cannot be blank'],
		minlength: [4, 'Name must be at least four characters']
	},
	comment: {
		type: String,
		required: [true, 'Comment cannot be blank']
	},
	message: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message'
	}
}, { timestamps: true });

//Register the schemas as Models
let Message = mongoose.model('Message', MessageSchema);
let Comment = mongoose.model('Comment', CommentSchema);

//Routes
app.get('/', function(req, res){
	Message.find({}).populate('comments').exec(function(err, messages){
		if(err){
			console.log(err);
		} else {
			return res.render('index.ejs', { messages: messages});
		}
	})
})

app.post('/messages', function(req, res){
	Message.create(req.body, function(err, message){
		if(err){
			let errors_arr = [];
			for(key in err.errors){
				let error = err.errors[key];
				errors_arr.push(error.message);
			}
		} else {
			console.log(message);
		}
	})
	return res.redirect('/');
})

app.post('/comments', function(req, res){
	Comment.create(req.body, function(err, comment){
		if(err){
			console.log(err);
		} else {
			Message.findByIdAndUpdate(req.body.message, { $push: { comments: comment._id } }, { new: true } ,function(err, message){
				if(err){
					console.log(err);
				} else {
					console.log(message);
					return res.redirect('/');
				}
			})
		}
	})
})

app.listen(8000, function(){
	console.log('listening on port 8000...');
})









