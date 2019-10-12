const router = require('express').Router()
const chat = require('../model/chat')
router.get('/', chat.main)
router.post('/chat',chat.chat)
module.exports = router