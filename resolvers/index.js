const { GraphQLScalarType } = require('graphql')
module.exports = {
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