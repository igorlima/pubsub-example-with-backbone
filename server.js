var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

var Edge = {}
var Vertex = {}

app
  .use(express.static(__dirname + '/'))
  .use(bodyParser.json()) // support json encoded bodies
  .use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

http.listen(process.env.PORT || 5000, function () {
  console.log('listening on *:5000')
})

io.on('connection', function (socket) {
  console.log('a user connected')
  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

  socket.on('retrieve-all-nodes', function () {
    Object.keys(Vertex).forEach(function (vertexId) {
      var node = Vertex[vertexId]
      socket.emit('node-added', node)
    })
    Object.keys(Edge).forEach(function (edgeId) {
      var link = Edge[edgeId]
      socket.emit('link-added', link)
    })
  })

  // socket.on('remove-all-nodes', function() {
  // ...
  // });

  socket.on('add-node', function (node, cb) {
    node.id = (new Date()).getTime()
    Vertex[node.id] = node
    cb && cb(node)
    socket.broadcast.emit('node-added', node)
    socket.emit('node-added', node)
  })

  socket.on('edit-node', function (node) {
    var vertex = node && node.id && Vertex[node.id]
    if (vertex) {
      vertex.label = node.label
      vertex.color = node.color
      socket.emit('node-edited', node)
      socket.broadcast.emit('node-edited', node)
    }
  })

  socket.on('remove-node', function (node) {
    if (node && node.id) {
      Vertex[node.id] = null
      socket.emit('node-removed', node)
      socket.broadcast.emit('node-removed', node)
    }
  })

  socket.on('add-link', function (link, cb) {
    link.id = (new Date()).getTime()
    Edge[link.id] = link
    cb && cb(link)
    socket.broadcast.emit('link-added', link)
    socket.emit('link-added', link)
  })

  socket.on('remove-link', function (link) {
    var edge = link && link.id && Edge[link.id]
    if (edge) {
      Edge[link.id] = null
      socket.broadcast.emit('link-removed', link)
      socket.emit('link-removed', link)
    }
  })
})
