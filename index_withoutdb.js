// 1. Require 'apollo-server'
const { ApolloServer } = require('apollo-server')
const { GraphQLScalarType } = require('graphql')

var sample_users = [
  { "githubLogin": "mHattrup", "name": "Mike Hattrup" },
  { "githubLogin": "gPlake", "name": "Glen Plake" },
  { "githubLogin": "sSchmidt", "name": "Scot Schmidt" }
]

var tags = [
  { "photoID": "1", "userID": "gPlake" },
  { "photoID": "2", "userID": "sSchmidt" },
  { "photoID": "2", "userID": "mHattrup" },
  { "photoID": "2", "userID": "gPlake" }
]

var sample_photos = [
  {
    "id": "1",
    "name": "Dropping the Heart Chute",
    "description": "The heart chute is one of my favorite chutes",
    "category": "ACTION",
    "githubUser": "gPlake",
    "created": "3-28-1977"
  },
  {
    "id": "2",
    "name": "Enjoying the sunshine",
    "category": "SELFIE",
    "githubUser": "sSchmidt",
    "created": "1-2-1985"
  },
  {
    id: "3",
    "name": "Gunbarrel 25",
    "description": "25 laps on gunbarrel today",
    "category": "LANDSCAPE",
    "githubUser": "sSchmidt",
    "created": "2018-04-15T19:09:57.308Z"
  }
]

var photos = sample_photos
var _id = 4

const typeDefs = `
  scalar DateTime

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
    inPhotos: [Photo!]!
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    githubUser: String!
    postedBy: User!
    taggedUsers: [User!]!
    created: DateTime!
  }
  
  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  
  input PostPhotoInput {
    name: String!
    category: PhotoCategory=PORTRAIT
    description: String
    githubUser: String
  }

  type Mutation {
    postPhoto(input: PostPhotoInput): Photo!
  }
`

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto(parent, args) {
       var newPhoto = {
         id: _id++,
         ... args.input,
         created: new Date()
       }
       photos.push(newPhoto)
       return newPhoto
    }
  },
  Photo: {
    url: parent => `${parent.id}.jpg`,
    postedBy: parent => {
      return sample_users.find(u=> u.githubLogin===parent.githubUser)
    },
    taggedUsers: parent => 
    // Returns an array of tags that only contain the current photo
    // Converts the array of tags into an array of userIDs
    // Converts array of userIDs into an array of user objects
      tags.filter(tag => tag.photoID === parent.id)
          .map(tag => tag.userID)
            .map(userID => sample_users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent => 
      // Returns an array of tags that only contain the current user
      // Converts the array of tags into an array of photoIDs
      // Converts array of photoIDs into an array of photo objects
      tags.filter(tag => tag.userID === parent.id)
       .map(tag => tag.photoID)
        .map(photoID => photos.find(p => p.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

// 2. Create a new instance of the server.
// 3. Send it an object with typeDefs (the schema) and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers
})


// 4. Call listen on the server to launch the web server
server
  .listen()
  .then(({url}) => console.log(`GraphQL Service running on ${url}`))
