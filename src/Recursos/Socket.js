import io from 'socket.io-client'

let socket = io(/*"//localhost:3001"*/"https://halogen-segment-328016.uc.r.appspot.com", { transports : ['websocket']})

export default socket;