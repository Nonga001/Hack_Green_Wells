import 'dotenv/config';
import { connectToDatabase } from './config/db';
import { User } from './models/User';
import { hashPassword } from './utils/password';

async function main() {
  const uri = process.env.MONGODB_URI || '';
  await connectToDatabase(uri);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin1234';
  const phoneNumber = process.env.ADMIN_PHONE || '0000000000';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);
  await User.create({ role: 'admin', email, passwordHash, phoneNumber, fullName: 'System Admin' });
  console.log('Admin created:', email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
