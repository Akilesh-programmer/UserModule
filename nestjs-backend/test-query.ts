import * as mongoose from 'mongoose';

const MASTER_URI = 'mongodb://localhost:27017/salesforce_master';

const StateSchema = new mongoose.Schema({
  name: String,
  code: String,
  countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  isActive: { type: Boolean, default: true }
});

const CountrySchema = new mongoose.Schema({
  name: String,
  code: String,
  isActive: { type: Boolean, default: true }
});

async function run() {
  const conn = await mongoose.createConnection(MASTER_URI).asPromise();
  console.log('Connected to MongoDB');
  const Country = conn.model('Country', CountrySchema);
  const State = conn.model('State', StateSchema);

  const countries = await Country.find({ isActive: true });
  console.log('Countries in database:', countries.map(c => ({ id: c._id.toString(), name: c.name })));

  if (countries.length > 0) {
    const firstCountryId = countries[0]._id.toString();
    console.log('Searching for active states for country:', countries[0].name, 'with ID:', firstCountryId);
    
    // Test 1: find with string ID
    const statesWithStringId = await State.find({ countryId: firstCountryId, isActive: true });
    console.log('States found with string ID:', statesWithStringId.map(s => s.name));

    // Test 2: find with ObjectId
    const statesWithObjectId = await State.find({ countryId: new mongoose.Types.ObjectId(firstCountryId), isActive: true });
    console.log('States found with ObjectId:', statesWithObjectId.map(s => s.name));

    // Test 3: find with active states query function logic
    const filter: any = { isActive: true };
    filter.countryId = firstCountryId;
    const statesFilter = await State.find(filter);
    console.log('States found with filter query:', statesFilter.map(s => s.name));
  }

  await conn.close();
}

run().catch(console.error);
