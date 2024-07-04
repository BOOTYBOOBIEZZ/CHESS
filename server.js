const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const { v4: uuidv4 } = require("uuid")
const { Chess } = require('chess.js')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static('public'))

let games = {}

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('createGame', () => {
        const gameId = uuidv4();
        games[gameId] = {
            id: gameId,
            players: [socket.id],
            board: createInitialBoard(),
            currentPlayer: 'w'
        }
        socket.join(gameId)
        socket.emit('gameCreated', gameId)
    })

    socket.on('joinGame', (gameId) => {
        const game = games[gamesId]
        if(game && game.players.length < 2){
            game.players.push(socket.id)
            socket.join(gameId)
            io.to(gameId).emit('startGame', game)

        } else {
            socket.emit('error', 'Game not found or already full')
        }
        
    })

    socket.on('makeMove', (gameId, move) =>{
        const game = games[gameId]
        if (game) {
            game.board = applyMove(game.board, move)
            game.currentPlayer = game.currentPlayer === 'w' ? 'b' : 'w'
            io.to(gameId).emit('moveMade', game) 
        }
    })

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id)
        for (const gameId in games) {
            const game = games[gameId];
            if (game.players.includes(socket.id)) {
                game.players = game.players.filter(player => player !== socket.id)
                if (game.players.length === 0) {
                    delete games[gameId]
                }
            }
        }

    })

})

const PORT = process.env.PORT || 3000
server.listen(3000, () => {
    console.log(`server is running on port ${PORT}`)

})