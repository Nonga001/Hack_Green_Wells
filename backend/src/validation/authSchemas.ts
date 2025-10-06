import { z } from 'zod';

export const baseCredentialsSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(7),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const customerRegisterSchema = baseCredentialsSchema.safeExtend({
  role: z.literal('customer'),
  fullName: z.string().min(1),
  deliveryAddress: z.object({
    addressLine: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
  }),
});

export const supplierRegisterSchema = baseCredentialsSchema.safeExtend({
  role: z.literal('supplier'),
  businessName: z.string().min(1),
  contactPersonName: z.string().min(1),
  businessAddress: z.string().min(1),
  businessRegistrationNumber: z.string().optional(),
});

export const agentRegisterSchema = baseCredentialsSchema.safeExtend({
  role: z.literal('agent'),
  fullName: z.string().min(1),
  vehicleType: z.string().min(1),
  vehicleRegistrationNumber: z.string().min(1),
  nationalIdOrLicense: z.string().min(1),
  baseArea: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type SupplierRegisterInput = z.infer<typeof supplierRegisterSchema>;
export type AgentRegisterInput = z.infer<typeof agentRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
