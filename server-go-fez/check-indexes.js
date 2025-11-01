const db = require('./Config/db');
const sequelize = db.getSequelize();

(async () => {
    try {
        const [results] = await sequelize.query(`
            SELECT TABLE_NAME, COUNT(*) as index_count 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'go_fez' 
            GROUP BY TABLE_NAME 
            ORDER BY index_count DESC
        `);
        
        console.log('Tables with indexes:');
        results.forEach(r => {
            const marker = r.index_count > 50 ? ' ⚠️ TOO MANY!' : '';
            console.log(`  ${r.TABLE_NAME}: ${r.index_count} indexes${marker}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
})();
