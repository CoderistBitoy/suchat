const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// Send message
router.post('/', auth, async (req, res) => {
    const { receiverId, text } = req.body;
    try {
        const message = new Message({
            sender: req.user.id,
            receiver: receiverId,
            text,
            seen: false  // NEW
        });
        await message.save();
        res.json(message);
    } catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

// Get messages between the two users
router.get('/:userId', auth, async (req, res) => {
    try {
        // Mark messages as seen
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user.id, seen: false },
            { $set: { seen: true } }
        );

        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

// DELETE all messages
// router.delete('/all', auth, async (req, res) => {
   // try {
   //     await Message.deleteMany({});
   //     res.json({ message: 'All messages deleted' });
  //  } catch (err) {
   //     res.status(500).json({ message: 'Server error', err });
  //  }
// });


module.exports = router;
