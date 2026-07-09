/**
 * Seeds the database with demo data for local development/demos.
 * Usage: npm run seed  (reads MONGO_URI from .env, same as the server)
 *
 * WARNING: this clears existing Users/Conversations/Messages/Groups/Notifications
 * in the target database before inserting fresh demo data. Never run against
 * a production database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

const DEMO_USERS = [
  { name: 'Priya Sharma', username: 'priya', email: 'priya@example.com', password: 'Password123' },
  { name: 'Alex Chen', username: 'alexchen', email: 'alex@example.com', password: 'Password123' },
  { name: 'Jordan Lee', username: 'jordanlee', email: 'jordan@example.com', password: 'Password123' },
  { name: 'Sam Rivera', username: 'samrivera', email: 'sam@example.com', password: 'Password123' },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing demo collections...');
  await Promise.all([
    User.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Group.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating demo users...');
  const users = [];
  for (const userData of DEMO_USERS) {
    // Password hashing happens automatically via the User model's pre-save hook
    const user = await User.create({ ...userData, isVerified: true });
    users.push(user);
  }
  const [priya, alex, jordan, sam] = users;

  console.log('Creating a 1:1 conversation with messages...');
  const directConversation = await Conversation.create({
    isGroup: false,
    participants: [priya._id, alex._id],
    lastActivity: new Date(),
  });

  const directMessages = await Message.insertMany([
    {
      conversation: directConversation._id,
      sender: priya._id,
      content: 'Hey! Are we still on for the 3pm sync?',
      type: 'text',
      status: 'seen',
      seenBy: [{ user: alex._id, at: new Date() }],
    },
    {
      conversation: directConversation._id,
      sender: alex._id,
      content: "Yep! I'll send the deck over beforehand.",
      type: 'text',
      status: 'delivered',
      deliveredTo: [{ user: priya._id, at: new Date() }],
    },
  ]);

  directConversation.lastMessage = directMessages[directMessages.length - 1]._id;
  await directConversation.save();

  console.log('Creating a demo group...');
  const group = await Group.create({
    name: 'Weekend Trip Crew',
    description: 'Planning the mountain trip 🏔️',
    admins: [priya._id],
    members: [priya._id, alex._id, jordan._id, sam._id],
    createdBy: priya._id,
  });

  const groupConversation = await Conversation.create({
    isGroup: true,
    group: group._id,
    participants: [priya._id, alex._id, jordan._id, sam._id],
    lastActivity: new Date(),
  });

  const groupMessages = await Message.insertMany([
    {
      conversation: groupConversation._id,
      sender: jordan._id,
      content: "I've booked the cabin for the 14th!",
      type: 'text',
      status: 'sent',
    },
    {
      conversation: groupConversation._id,
      sender: sam._id,
      content: "Count me in, I'll bring the gear.",
      type: 'text',
      status: 'sent',
    },
  ]);

  groupConversation.lastMessage = groupMessages[groupMessages.length - 1]._id;
  await groupConversation.save();

  console.log('Creating a sample notification...');
  await Notification.create({
    recipient: alex._id,
    sender: priya._id,
    type: 'message',
    conversation: directConversation._id,
    message: directMessages[0]._id,
    text: directMessages[0].content,
  });

  console.log('\nSeed complete. Demo accounts (all use password "Password123"):');
  DEMO_USERS.forEach((u) => console.log(`  - ${u.email}`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
