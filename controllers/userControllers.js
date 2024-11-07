const bcryptjs = require('bcryptjs');

const User = require("../models/userModel");
const jwt = require('jsonwebtoken');

// Register a new User
// POST : api/users/register
//UNPROTECTED

const registerUser = async (req, res, next) => {
    try {
        const { email, password, password2, isAdmin = false } = req.body;

        if (!email || !password) {
            return res.json("Fill in all the fields");
        }

        const newEmail = email.toLowerCase();

        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return res.json("Email already exists!");
        }

        if (password.trim().length < 6) {
            return res.json("Password should be at least 6 characters");
        }

        if (password !== password2) {
            return res.json("Passwords do not match");
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPass = await bcryptjs.hash(password, salt);

        // Include `isAdmin` field in the user creation
        const newUser = await User.create({
            email: newEmail,
            password: hashedPass,
            isAdmin,  // Set `isAdmin` based on request or default
        });

        res.status(201).json(`New User ${newUser.email} has been registered successfully!`);
    } catch (error) {
        console.log(error);
        res.status(422).json("Registration failed");
    }
};




// login a new User
// POST : api/users/login
//UNPROTECTED

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json("Fill in all the details");
        }

        const newEmail = email.toLowerCase();
        const user = await User.findOne({ email: newEmail });

        if (!user) {
            return res.json("Invalid credentials");
        }

        const comparePass = await bcryptjs.compare(password, user.password);

        if (!comparePass) {
            return res.json("Invalid credentials");
        }

        // Check if the user is an admin
        const { _id: id, name, isAdmin } = user;
        
        // Include `isAdmin` in the token if you need to verify it on the client side
        const token = jwt.sign({ id, name, isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Respond with user details and the admin status
        res.status(200).json({ token, id, name, isAdmin });
    } catch (error) {
        console.log(error);
        res.json("Login failed. Please check your credentials");
    }
};



// Middleware to verify JWT and check admin privileges
const requireAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json("Access denied. No token provided.");
        }

        // Verify token and extract payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if the user has admin privileges
        if (!req.user.isAdmin) {
            return res.status(403).json("Access denied. Admins only.");
        }

        // Proceed to the next middleware or route handler
        next();

    } catch (error) {
        res.status(401).json("Invalid or expired token.");
    }
};





// Example route that allows admins to change data
// PUT : api/users/:id


const updateData = (requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedData = req.body;

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        if (!user) {
            return res.status(404).json("User not found.");
        }
        const dataa = await User.findById(userId);
        console.log(dataa)

        res.status(200).json({ message: "User data updated successfully.", user });
    } catch (error) {
        res.status(500).json("Failed to update user data.");
    }
});




module.exports = {
    registerUser , loginUser , updateData
}

