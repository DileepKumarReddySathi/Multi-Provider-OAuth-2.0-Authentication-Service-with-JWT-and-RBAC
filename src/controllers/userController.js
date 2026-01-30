import * as userService from '../services/userService.js';

export const getMe = async (req, res) => {
    try {
        const user = await userService.findUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateMe = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        const user = await userService.updateUser(req.user.id, { name });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.findAllUsers();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
