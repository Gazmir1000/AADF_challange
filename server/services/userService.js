const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// Register a new user
exports.registerUser = async (userData) => {
  const { name, NUIS, email, phone, address, password, role } = userData;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    NUIS,
    email,
    phone,
    address,
    password,
    role:"vendor"
  });

  if (user) {
    return {
      _id: user._id,
      name: user.name,
      NUIS: user.NUIS,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id)
    };
  } else {
    throw new Error('Invalid user data');
  }
};

// Authenticate user
exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      NUIS: user.NUIS,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token: generateToken(user._id)
    };
  } else {
    throw new Error('Invalid email or password');
  }
};

// Get user by ID
exports.getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  
  if (user) {
    return user;
  } else {
    throw new Error('User not found');
  }
};

// Get all users
exports.getAllUsers = async () => {
  return await User.find({}).select('-password');
};

// Update user
exports.updateUser = async (id, userData) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  // Update fields
  user.name = userData.name || user.name;
  user.NUIS = userData.NUIS || user.NUIS;
  user.email = userData.email || user.email;
  user.phone = userData.phone || user.phone;
  user.address = userData.address || user.address;
  if (userData.password) {
    user.password = userData.password;
  }
  user.role = userData.role || user.role;

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    NUIS: updatedUser.NUIS,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    role: updatedUser.role
  };
};

// Delete user
exports.deleteUser = async (id) => {
  const user = await User.findById(id);

  if (!user) {
    throw new Error('User not found');
  }

  await user.deleteOne();
  return { message: 'User removed' };
}; 