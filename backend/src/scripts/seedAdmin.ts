import { connectDatabase, disconnectDatabase } from '../config/database';
import { AuthService } from '../modules/auth/auth.service';
import { env } from '../config/env';

async function seed() {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDatabase();

    const name = process.env.SEED_ADMIN_NAME || env.SUPER_ADMIN_NAME;
    const email = process.env.SEED_ADMIN_EMAIL || env.SUPER_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD || env.SUPER_ADMIN_PASSWORD;

    console.log(`[Seed] Checking super-admin credentials for: ${email}`);
    const admin = await AuthService.seedSuperAdmin(name, email, password);

    console.log('---------------------------------------------');
    console.log('Super Admin Setup Summary:');
    console.log(`  Name:  ${admin.name}`);
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role:  ${admin.role}`);
    console.log(`  ID:    ${admin._id}`);
    console.log('---------------------------------------------');

    await disconnectDatabase();
    process.exit(0);
  } catch (error: any) {
    console.error('[Seed Error] Failed to seed super admin:', error.message || error);
    await disconnectDatabase();
    process.exit(1);
  }
}

seed();

