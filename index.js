const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { readFileSync } = require('fs')
const expressPlayground = require('graphql-playground-middleware-express').default
const resolvers = require('./resolvers')
const { MongoClient } = require('mongodb')
require('dotenv').config()

var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

async function start() {
  const app = express()
  const MANGO_DB = process.env.DB_HOST
  const client = await MangoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true }
  )
  const db = client.db()
  const context = {db}
  const server = new ApolloServer({ typeDefs, resolvers, context})

  server.applyMiddleware({ app })

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

  app.get('/playground', expressPlayground({ endpoint: '/graphql'}))

  app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running @ http://localhost:4000${server.graphqlPath}`)
  )
}

start()




