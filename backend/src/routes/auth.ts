import express, { type Request, type Response } from 'express';
import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import {
  customerRegisterSchema,
  supplierRegisterSchema,
  agentRegisterSchema,
  loginSchema,
} from '../validation/authSchemas.js';

const router = express.Router();

router.post('/register/customer', async (req: Request, res: Response) => {
  const parse = customerRegisterSchema.safeParse({ ...req.body, role: 'customer' });
  if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });
  const { fullName, email, phoneNumber, password, deliveryAddress } = parse.data;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email address already exists. Please use a different email or try logging in.' });
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      role: 'customer', fullName, email, phoneNumber, passwordHash, deliveryAddress,
    });
    const token = signToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/register/supplier', async (req: Request, res: Response) => {
  const parse = supplierRegisterSchema.safeParse({ ...req.body, role: 'supplier' });
  if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });
  const { businessName, contactPersonName, email, phoneNumber, password, businessAddress, businessRegistrationNumber } = parse.data;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email address already exists. Please use a different email or try logging in.' });
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      role: 'supplier', businessName, contactPersonName, email, phoneNumber, passwordHash, businessAddress, businessRegistrationNumber,
    });
    const token = signToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/register/agent', async (req: Request, res: Response) => {
  const parse = agentRegisterSchema.safeParse({ ...req.body, role: 'agent' });
  if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });
  const { fullName, email, phoneNumber, password, vehicleType, vehicleRegistrationNumber, nationalIdOrLicense, baseArea } = parse.data;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'An account with this email address already exists. Please use a different email or try logging in.' });
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      role: 'agent', fullName, email, phoneNumber, passwordHash, vehicleType, vehicleRegistrationNumber, nationalIdOrLicense, baseArea,
    });
    const token = signToken({ sub: String(user._id), role: user.role });
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ errors: parse.error.flatten() });
  const { email, password } = parse.data;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken({ sub: String(user._id), role: user.role });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
