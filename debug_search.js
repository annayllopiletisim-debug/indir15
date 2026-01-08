const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/savvy_saver_db');

// Define Brand schema (simplified)
const brandSchema = new mongoose.Schema({
  id: String,
  name: String,
  slug: String
}, { collection: 'brands' });

const Brand = mongoose.model('Brand', brandSchema);

// Turkish character normalization
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c');
}

async function testSearch() {
  try {
    console.log('Testing search functionality...');
    
    // Get all brands
    const allBrands = await Brand.find({}).lean();
    console.log(`Found ${allBrands.length} brands in database`);
    
    // Test search for "kara"
    const query = 'kara';
    const normalizedQuery = normalizeText(query);
    console.log(`Searching for: "${query}" (normalized: "${normalizedQuery}")`);
    
    const matches = [];
    
    allBrands.forEach((brand) => {
      const normalizedName = normalizeText(brand.name);
      console.log(`Checking brand: "${brand.name}" (normalized: "${normalizedName}")`);
      
      if (normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName)) {
        console.log(`✅ Match found: ${brand.name}`);
        matches.push(brand);
      }
    });
    
    console.log(`\nTotal matches: ${matches.length}`);
    matches.forEach(match => console.log(`- ${match.name}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testSearch();