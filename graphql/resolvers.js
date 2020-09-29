const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const { Op } = require('sequelize')
// const Op = Sequelize.Op; //this also works perfectly
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const Album = require('../models/album');
const Song = require('../models/song');
const Artist = require('../models/artist');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_API_KEY
  }
}));

module.exports = {

  // The resolver(method) for creating a new user account
  createUser: async function({ userInput }, req) {
    const errors = [];

    // Validating user input here(If error exists, push a mesage to the error array)
    validator.isEmpty(userInput.firstname) ? errors.push({ message: 'Firstname is required!' }) : "";
    validator.isEmpty(userInput.lastname) ? errors.push({ message: 'Lastname is required!' }) : "";
    validator.isEmpty(userInput.email) ? errors.push({ message: 'Email is required!' }) : "";
    !validator.isEmail(userInput.email) ? errors.push({ message: 'Email is invalid!' }) : "";
    !validator.isLength(userInput.password, { min: 5 }) ? errors.push({ message: 'Password is too short!' }) : "";

    // If errors exist in the error array throw an error
    if (errors.length > 0) {
      const error = new Error(errors[0].message);
      // error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    // Check for an account already assoicated with the email the user submitted
    const existingUser = await User.findOne({ where: { email: userInput.email } });

    // If email already assoicated with an account, throw an error
    if (existingUser) {
      const error = new Error('This email is already assoicated with an accoount');
      throw error;
    }

    // Else encrypt the password
    const hashedPw = await bcrypt.hash(userInput.password, 12);

    // and then create a new user
    const user = await new User({
      firstname: userInput.firstname,
      lastname: userInput.lastname,
      email: userInput.email,
      password: hashedPw
    });

    // save the user details in the database
    const createdUser = await user.save();

    return {
      ...createdUser.dataValues,
      created_at: createdUser.dataValues.created_at.toISOString(),
      updated_at: createdUser.dataValues.updated_at.toISOString()
    };
  },

  // The Resolver(method) for login
  login: async function({ email, password }, req) {

    // Check for the user existence
    const user = await User.findOne({ where: { email: email } });

    // If user does not exist, throw an error
    if (!user) {
      const error = new Error('Check Username or Password');
      error.statusCode = 401;
      throw error;
    }

    // Compare the password the user submitted to the one encrypted in the database
    const isEqual = await bcrypt.compare(password, user.password);

    // Throw an error if the passwords mismatch
    if (!isEqual) {
      const error = new Error('Check Username or Password');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'somesupersecretivesecret', { expiresIn: '1hr' }
    );

    return { userId: user.id, token: token };
  },

  // The resolver(method) for changing password
  changePassword: async function({ pwdInput }, req) {
    // Check for Authorization
    if (!req.isAuth) {
      const error = new Error('Not Authenticated!');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findOne({ where: { id: req.userId } });
    if (!user) {
      const error = new Error('Please login to change your password.');
      error.statusCode = 401;
      throw error;
    }

    // Compare the password the user submitted to the one encrypted in the database
    const isEqual = await bcrypt.compare(pwdInput.currentPassword, user.password);

    // Throw an error if the passwords mismatch
    if (!isEqual) {
      const error = new Error('Please enter your current password.');
      error.statusCode = 401;
      throw error;
    }

    const hashedPw = await bcrypt.hash(pwdInput.newPassword, 12);
    user.password = hashedPw;

    await user.save();
    return true;
  },

  // The resolver(method) for fetching albums
  albums: async function(_, req) {
    // const albums =  await Album.findAll({ order: Sequelize.literal('rand()'), limit: 10 }); //Returns an array of objects [{}, {}]
    const albums =  await Album.findAll({ order: Sequelize.literal('random()'), limit: 10 }); //Returns an array of objects [{}, {}]

    if (!albums) {
      const error = new Error('No albums found');
      error.statusCode = 404;
      throw error;
    }

    const returnedAlbums = albums.map(result => result.dataValues);  // [{}, {}, {}]
    // use curly-braces {} in the return statement when the schema definition points to a type definition(which should be an object)
    return returnedAlbums;
  },

  // The resolver(method) for fetching a single album
  album: async function({ albumId }, req) {
    const album = await Album.findOne({ where: { id: albumId } }); // Returns an object with key value pairs {key: value}

    if (!album) {
      const error = new Error('No albums found');
      error.statusCode = 404;
      throw error;
    }

    const returnedAlbum = album.dataValues;
    return returnedAlbum;
  },

  // The resolver(method) for fetching songs peculiar to an album
  albumSongs: async function({ albumId }, req) {
    const songs = await Song.findAll({ where: { album: albumId } });

    if (!songs) {
      const error = new Error('No songs found');
      error.statusCode = 404;
      throw error;
    }

    const returnedSongs = songs.map(result => result.dataValues);
    return returnedSongs;
  },

  // The resolver(method) for fetching the number of songs peculiar to an album
  numOfSongs: async function({ albumId }, req) {
    const numOfSongs = await Song.count({ where: { album: albumId } });

    if (!numOfSongs) {
      const error = new Error('No songs found');
      error.statusCode = 404;
      throw error;
    }
    
    return numOfSongs;
  },

  // The resolver(method) for fetching all songs in the database
  allSongs: async function(_, req) {
  // const songs =  await Song.findAll({ order: Sequelize.literal('rand()') }); //Returns an array of objects [{}, {}]
  const songs =  await Song.findAll({ order: Sequelize.literal('random()') }); //Returns an array of objects [{}, {}]

    if (!songs) {
      const error = new Error('No songs found');
      error.statusCode = 404;
      throw error;
    }

    const returnedSongs = songs.map(result => result.dataValues);  // [{}, {}, {}]
    // use curly-braces {} in the return statement when the schema definition points to a type definition(which should be an object)
    return returnedSongs;
  },

  // The resolver(method) for fetching a single artist
  artist: async function({ artistId }, req) {
    const artist = await Artist.findOne({ where: { id: artistId } });

    if (!artist) {
      const error = new Error('No artists found');
      error.statusCode = 404;
      throw error;
    }

    return artist.dataValues;
  },

  // The resolver(method) for fetching loggedIn user's details
  getUserDetails: async function({ userId }, req) {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      const error = new Error('Please Log In');
      error.statusCode = 404;
      throw error;
    }

    return user.dataValues;
  },

  // The resolver(method) for fetching loggedIn user's details
  updateUserDetails: async function({ detailsInput }, req) {

    // Check for Authorization
    if (!req.isAuth) {
      const error = new Error('Not Authenticated!');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findOne({ where: { id: req.userId } });
    if (!user) {
      const error = new Error('Please login to update your details.');
      error.statusCode = 401;
      throw error;
    }

    user.firstname = detailsInput.firstname;
    user.lastname = detailsInput.lastname;
    user.email = detailsInput.email;
    await user.save();

    return true;
  },

  // The resolver(method) for sending password reset link
  passwordResetRequest: async function({ userEmail }, req) {
    const secret = 'abcdefg';
    const token = crypto.createHmac('sha256', secret).update(userEmail).digest('hex');
    if (!token) {
      const error = new Error('Something was wrong somewhere.');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      const error = new Error('Please enter a valid email address.');
      error.statusCode = 401;
      throw error;
    }

    user.reset_token = token;
    user.reset_token_expiration = Date.now() + 3600000;
    await user.save();
      
    try {
      const sent = await transporter.sendMail({
        to: userEmail,
        from: 'no-reply@spotified.com',
        subject: 'Password Reset',
        html: `
          <p>You requested for a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset-pw/${token}">
            <b style="padding: 0.4rem 1.7rem; background-color: #413e3e; color: #fff; border-radius: 1rem;">
              LINK</b></a> to set a new password.</p>
        `
      });
    } catch(error) {
      // const error = new Error('Something was wrong somewhere.');
      error.message = 'Please kindly check your internet connection';
      error.statusCode = 401;
      throw error;
    }

    return true;
  },


  // The resolver(method) for resetting the password
  passwordResetExecute: async function({ pwdInput }, req) {
    const user = await User.findOne({ where: { [Op.and]: [{ reset_token: pwdInput.token }, { reset_token_expiration: { [Op.gt]: Date.now() } }] } });

    if (!user) {
      const error = new Error('Something went wrong.');
      error.statusCode = 401;
      throw error;
    }

    // console.log("COMPARE", user.dataValues.reset_token_expiration > Date.now());
    // console.log("COMPARE", user.dataValues.reset_token_expiration > new Date());

    const hashedPw = await bcrypt.hash(pwdInput.newPassword, 12);
    user.password = hashedPw;
    user.reset_token = null;
    user.reset_token_expiration = null;
    await user.save();

    return true;
  }
};
// return { posts: posts.map(p => {
//     return { ...p._doc, _id: p._id.toString(), created_at: p.created_at.toISOString(), updated_at: p.updated_at.toISOString() };
// }), totalPosts: totalPosts };
