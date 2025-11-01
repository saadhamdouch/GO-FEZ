const db = require('./Config/db');
const { User } = require('./models/User');
const sequelize = db.getSequelize();

(async () => {
    try {
        // Check if user with ID 1 exists
        let user = await User.findByPk(1);
        
        if (user) {
            console.log('✅ Test user already exists:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email || 'N/A'}`);
            console.log(`   Phone: ${user.phone || 'N/A'}`);
        } else {
            console.log('Creating test user...');
            
            // Create a test user
            user = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                phone: '+1234567890',
                password: '$2b$10$X7YZ1234567890abcdefghijklmnopqrstuvwxyz', // Hashed password for 'test123'
                authProvider: 'phone',
                primaryIdentifier: '+1234567890',
                isVerified: true,
                role: 'user'
            });
            
            console.log('✅ Test user created successfully:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.firstName} ${user.lastName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Phone: ${user.phone}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
})();
