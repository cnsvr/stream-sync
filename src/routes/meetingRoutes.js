const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, async (req, res, next) => {
    try {
        const { meetingId, participant } = req.body;
        const meeting = new Meeting({ meetingId, participant, creator: req.user._id });
        const createdMeeting = await meeting.save();
        const populatedMeeting = await Meeting.findById(createdMeeting._id).populate('creator participant', 'email fullName');        res.status(201).json({ message: 'Meeting created successfully', meeting: populatedMeeting });

        res.status(201).json({ message: 'Meeting created successfully', meeting: populatedMeeting });
    } catch (error) {
        next(error);
    }
});

router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const meetings = await Meeting.find({ creator: req.user._id }).populate('creator participant', 'email fullName');
        const invitedMeetings = await Meeting.find({ participant: req.user._id }).populate('creator participant', 'email fullName');
        res.json(meetings.concat(invitedMeetings));
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOne({ _id: req.params.id }).populate('creator participant', 'email fullName');
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        next(error);
    }
})

module.exports = router;
