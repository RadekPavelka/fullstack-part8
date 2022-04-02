const { UserInputError, AuthenticationError } = require("apollo-server");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author) {
        if (!args.genre) {
          return await Book.find({}).populate("author");
        }
        return await Book.find({ genres: args.genre }).populate("author");
      }

      const author = await Author.findOne({ name: args.author });

      console.log("author", author);

      if (!author) {
        return [];
      }

      return args.genre
        ? await Book.find({
            genres: args.genre,
            author: author._id,
          }).populate("author")
        : await Book.find({ author: author._id }).populate("author");
    },
    allAuthors: async (root, args) => {
      console.log("Author.find");
      return await Author.find({}).populate("books");
    },
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    bookCount: async (root, args) => {
      /*       let books = await Book.find({}).populate("author");
      let authorsBooks = books.filter((b) => b.author.name === root.name); */
      /*       const booksByAuthor = await Book.find({
        author: {
          $in: [root._id]
        } 
      }) */
      console.log("root", root);
      return root.books.length;
    },
  },

  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error.message, { invalidArgs: args });
        }
      }

      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }

      author.books = author.books.concat(book);
      console.log("author after concat", author);
      await author.save();
      const addedBook = book.populate("author");
      pubsub.publish("BOOK_ADDED", { bookAdded: addedBook });
      return addedBook;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const author = await Author.findOne({ name: args.name });
      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return author;
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
