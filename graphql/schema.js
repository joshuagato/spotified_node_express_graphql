const { buildSchema } = require('graphql');

module.exports = buildSchema(`
  type User {
    id: ID!
    firstname: String!
    lastname: String!
    email: String!
    password: String!
    created_at: String!
    updated_at: String!
  }
  type AuthData {
    userId: String!
    token: String!
  }
  type Album {
    id: ID!
    title: String!
    artist: Int!
    genre: Int!
    artwork_path: String!
  }
  type Song {
    id: ID!
    title: String!
    artist: Int!
    album: Int!
    genre: Int!
    duration: String!
    path: String!
    album_order: Int!
    plays: Int!
  }
  type Artist {
    id: ID!
    name: String!
  }

  input UserInputData {
    firstname: String!
    lastname: String!
    email: String!
    password: String!
  }
  input ChangePasswordInputData {
    currentPassword: String!
    newPassword: String!
    confirmNewPassword: String!
  }
  input ResetPasswordInputData {
    token: String!
    newPassword: String!
    confirmNewPassword: String!
  }
  input DetailsInputData {
    firstname: String!
    lastname: String!
    email: String!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    albums: [Album]!
    album(albumId: Int!): Album!
    albumSongs(albumId: Int!): [Song]!
    numOfSongs(albumId: Int!): Int!
    allSongs: [Song]!
    artist(artistId: Int!): Artist!
    getUserDetails(userId: Int!): User!
  }

  type RootMutation {
    createUser(userInput: UserInputData): User!
    changePassword(pwdInput: ChangePasswordInputData): Boolean
    passwordResetRequest(userEmail: String!): Boolean
    passwordResetExecute(pwdInput: ResetPasswordInputData): Boolean
    updateUserDetails(detailsInput: DetailsInputData): Boolean
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
