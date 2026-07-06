/**
 * seed-all.ts — Full Sample Data Seeder for SalesForce
 *
 * Drops all salesforce_* databases and re-seeds with realistic data:
 *   salesforce_admin  → UserType, User, Permission
 *   salesforce_master → Country, State, City, Pincode, Area, Market,
 *                       Manager, SalesRep, Dealer, Company, ShopType, ExpenseType
 *   salesforce_items  → Category, Group, Tax, UnitOfMeasure, PackingType, Item, Counter
 *
 * Run:  npx ts-node seed-all.ts
 */

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const ADMIN_URI  = process.env.MONGO_URI_ADMIN  || 'mongodb://localhost:27017/salesforce_admin';
const MASTER_URI = process.env.MONGO_URI_MASTER || 'mongodb://localhost:27017/salesforce_master';
const ITEMS_URI  = process.env.MONGO_URI_ITEMS  || 'mongodb://localhost:27017/salesforce_items';
const ROUNDS     = 10; // bcrypt rounds (lower for speed in seed)

const oid  = () => new mongoose.Types.ObjectId();
const ok   = (msg: string) => console.log(`  ✅ ${msg}`);
const head = (msg: string) => console.log(`\n${msg}`);

/* ══════════════════════════════════════════════════════════════
   SCHEMAS (inline — no NestJS DI needed for seeding)
══════════════════════════════════════════════════════════════ */

// ── ADMIN ──────────────────────────────────────────────────────
const UserTypeSchema = new mongoose.Schema(
  { name: String, description: { type: String, default: '' }, isActive: { type: Boolean, default: true } },
  { timestamps: true },
);
const UserSchema = new mongoose.Schema(
  {
    userTypeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'UserType', required: true },
    name:        { type: String, default: '' },
    username:    { type: String, required: true, unique: true },
    passwordHash:{ type: String, required: true },
    description: { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true },
);
const PermissionSchema = new mongoose.Schema(
  {
    userTypeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'UserType', required: true, unique: true },
    permissions: { type: Object, default: {} },
  },
  { timestamps: true },
);

// ── MASTER ─────────────────────────────────────────────────────
const CountrySchema  = new mongoose.Schema({ name: String, code: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const StateSchema    = new mongoose.Schema({ name: String, code: String, countryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const CitySchema     = new mongoose.Schema({ name: String, stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const PincodeSchema  = new mongoose.Schema({ code: String, stateId: { type: mongoose.Schema.Types.ObjectId }, cityId: { type: mongoose.Schema.Types.ObjectId }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const AreaSchema     = new mongoose.Schema({ name: String, pincodeId: { type: mongoose.Schema.Types.ObjectId }, cityId: { type: mongoose.Schema.Types.ObjectId }, stateId: { type: mongoose.Schema.Types.ObjectId }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const MarketSchema   = new mongoose.Schema({ name: String, stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' }, districtId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const ShopTypeSchema = new mongoose.Schema({ name: String, description: { type: String, default: '' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const ExpTypeSchema  = new mongoose.Schema({ name: String, description: { type: String, default: '' }, isActive: { type: Boolean, default: true } }, { timestamps: true });
const CompanySchema  = new mongoose.Schema({ name: String, code: String, address: String, phone: String, email: String, contactPerson: String, gstNo: String, isActive: { type: Boolean, default: true } }, { timestamps: true });

const addrSubdoc = {
  stateId:   { type: mongoose.Schema.Types.ObjectId, default: null },
  cityId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  pincodeId: { type: mongoose.Schema.Types.ObjectId, default: null },
  areaId:    { type: mongoose.Schema.Types.ObjectId, default: null },
  street:    { type: String, default: '' },
};
const ManagerSchema = new mongoose.Schema(
  { name: String, profilePic: { type: String, default: null }, mobile: String, email: String,
    aadhaarNo: String, drivingLicenseNo: String, panCardNo: String,
    username: { type: String, unique: true }, passwordHash: String, userTypeId: mongoose.Schema.Types.ObjectId,
    address: addrSubdoc, isActive: { type: Boolean, default: true } },
  { timestamps: true },
);
const SalesRepSchema = new mongoose.Schema(
  { name: String, profilePic: { type: String, default: null }, mobile: String, email: String,
    aadhaarNo: String, drivingLicenseNo: String, panCardNo: String,
    managerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    username: { type: String, unique: true }, passwordHash: String, userTypeId: mongoose.Schema.Types.ObjectId,
    address: addrSubdoc, isActive: { type: Boolean, default: true } },
  { timestamps: true },
);
const DealerSchema = new mongoose.Schema(
  { dealerName: String, phoneNumber: String, whatsappNumber: String, email: String,
    managerId:  { type: mongoose.Schema.Types.ObjectId, default: null },
    salesRepId: { type: mongoose.Schema.Types.ObjectId, default: null },
    marketId:   { type: mongoose.Schema.Types.ObjectId },
    shopTypeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    address: addrSubdoc,
    panNo: String, panName: String, gstNo: String, aadhaarNo: String,
    drivingLicenseNo: String, securityChequeNo: String, image: { type: String, default: null },
    isActive: { type: Boolean, default: true } },
  { timestamps: true },
);

// ── ITEMS ──────────────────────────────────────────────────────
const CategorySchema  = new mongoose.Schema({ name: String, code: String, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const GroupSchema     = new mongoose.Schema({ name: String, code: String, categoryId: mongoose.Schema.Types.ObjectId, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const TaxSchema       = new mongoose.Schema({ taxType: String, percentage: Number, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const UoMSchema       = new mongoose.Schema({ abbreviation: String, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const PackTypeSchema  = new mongoose.Schema({ name: String, unitsPerPack: Number, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const CounterSchema   = new mongoose.Schema({ key: { type: String, unique: true }, seq: { type: Number, default: 0 } });
const ItemSchema      = new mongoose.Schema(
  { itemName: String, itemCode: String, description: String,
    categoryId: mongoose.Schema.Types.ObjectId, groupId: mongoose.Schema.Types.ObjectId,
    taxId: mongoose.Schema.Types.ObjectId, uomId: mongoose.Schema.Types.ObjectId,
    packingTypeId: mongoose.Schema.Types.ObjectId,
    itemPrice: Number, itemsPerBox: Number, boxRate: Number,
    minStockLevel: Number, maxStockLevel: Number, hsnCode: String, isActive: { type: Boolean, default: true } },
  { timestamps: true },
);

/* ══════════════════════════════════════════════════════════════
   PERMISSION HELPERS
══════════════════════════════════════════════════════════════ */
const ALL_MODULES = [
  'userType','userCreation','userPermission',
  'manager','salesRep',
  'country','state','city','pincode','area','market',
  'dealer','expenseType','company','shopType',
  'category','group','tax','unitOfMeasure','packingType','item',
];

type Perm = { create: boolean; read: boolean; update: boolean; delete: boolean };
type Permissions = Record<string, Perm>;

const fullPerm  = (): Perm => ({ create: true,  read: true,  update: true,  delete: true  });
const readPerm  = (): Perm => ({ create: false, read: true,  update: false, delete: false });
const editPerm  = (): Perm => ({ create: false, read: true,  update: true,  delete: false });
const staffPerm = (): Perm => ({ create: true,  read: true,  update: true,  delete: false });

/** Admin — full access to all modules */
const buildAdminPerms = (): Permissions =>
  Object.fromEntries(ALL_MODULES.map((m) => [m, fullPerm()]));

/** Manager — create/read/update on operational modules, no admin modules */
const buildManagerPerms = (): Permissions => {
  const perms: Permissions = Object.fromEntries(ALL_MODULES.map((m) => [m, readPerm()]));
  // operational full access
  ['manager','salesRep','dealer','market','area','pincode','company'].forEach((m) => { perms[m] = staffPerm(); });
  // no access to admin modules
  ['userType','userCreation','userPermission'].forEach((m) => { perms[m] = { create: false, read: false, update: false, delete: false }; });
  return perms;
};

/** SalesRep — read + update on own operational data */
const buildSalesRepPerms = (): Permissions => {
  const perms: Permissions = Object.fromEntries(ALL_MODULES.map((m) => [m, readPerm()]));
  ['dealer'].forEach((m) => { perms[m] = editPerm(); });
  ['userType','userCreation','userPermission','manager','salesRep'].forEach((m) => {
    perms[m] = { create: false, read: false, update: false, delete: false };
  });
  return perms;
};

/** Viewer — read only, no admin modules */
const buildViewerPerms = (): Permissions => {
  const perms: Permissions = Object.fromEntries(ALL_MODULES.map((m) => [m, readPerm()]));
  ['userType','userCreation','userPermission'].forEach((m) => { perms[m] = { create: false, read: false, update: false, delete: false }; });
  return perms;
};

/* ══════════════════════════════════════════════════════════════
   HSN counter
══════════════════════════════════════════════════════════════ */
let hsnSeq = 0;
const nextHsn = () => `HSN${String(++hsnSeq).padStart(5, '0')}`;

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
async function main() {
  console.log('\n🌱 SalesForce — Full Sample Data Seeder\n');

  const adminConn  = await mongoose.createConnection(ADMIN_URI).asPromise();
  const masterConn = await mongoose.createConnection(MASTER_URI).asPromise();
  const itemsConn  = await mongoose.createConnection(ITEMS_URI).asPromise();
  console.log('🔌 Connected to all 3 databases');

  head('🗑️  Clearing all databases...');
  await Promise.all([adminConn.db!.dropDatabase(), masterConn.db!.dropDatabase(), itemsConn.db!.dropDatabase()]);
  ok('All databases cleared');

  /* ── Register models ────────────────────────────────────── */
  const UserType   = adminConn.model('UserType',    UserTypeSchema);
  const User       = adminConn.model('User',        UserSchema);
  const Permission = adminConn.model('Permission',  PermissionSchema);

  const Country  = masterConn.model('Country',    CountrySchema);
  const State    = masterConn.model('State',       StateSchema);
  const City     = masterConn.model('City',        CitySchema);
  const Pincode  = masterConn.model('Pincode',     PincodeSchema);
  const Area     = masterConn.model('Area',        AreaSchema);
  const Market   = masterConn.model('Market',      MarketSchema);
  const ShopType = masterConn.model('ShopType',    ShopTypeSchema);
  const ExpType  = masterConn.model('ExpenseType', ExpTypeSchema);
  const Company  = masterConn.model('Company',     CompanySchema);
  const Manager  = masterConn.model('Manager',     ManagerSchema);
  const SalesRep = masterConn.model('SalesRep',    SalesRepSchema);
  const Dealer   = masterConn.model('Dealer',      DealerSchema);

  const Category  = itemsConn.model('Category',     CategorySchema);
  const Group     = itemsConn.model('Group',         GroupSchema);
  const Tax       = itemsConn.model('Tax',           TaxSchema);
  const UoM       = itemsConn.model('UnitOfMeasure', UoMSchema);
  const PackType  = itemsConn.model('PackingType',   PackTypeSchema);
  const Counter   = itemsConn.model('Counter',       CounterSchema);
  const Item      = itemsConn.model('Item',          ItemSchema);

  /* ══════════════════════════════════════════════════════════
     ADMIN — UserTypes, Users, Permissions
  ══════════════════════════════════════════════════════════ */
  head('👤 Seeding Admin...');

  const [utAdmin, utManager, utSalesRep, utViewer] = await UserType.insertMany([
    { name: 'Admin',    description: 'Full system administrator access' },
    { name: 'Manager',  description: 'Field manager — manage dealers, staff and areas' },
    { name: 'Sales Rep',description: 'Sales representative — manage dealers and view data' },
    { name: 'Viewer',   description: 'Read-only access to all non-admin data' },
  ]);
  ok(`User Types: Admin, Manager, Sales Rep, Viewer`);

  // Hash passwords in parallel
  const [hashAdmin, hashRajesh, hashPriya, hashKarthik, hashDeepaSales] = await Promise.all([
    bcrypt.hash('Akilesh@123', ROUNDS),
    bcrypt.hash('Manager@123', ROUNDS),
    bcrypt.hash('Sales@1234',  ROUNDS),
    bcrypt.hash('Karthik@123', ROUNDS),
    bcrypt.hash('Deepa@12345', ROUNDS),
  ]);

  await User.insertMany([
    { userTypeId: utAdmin._id,    name: 'Akilesh S',      username: 'akilesh',       passwordHash: hashAdmin,      description: 'Primary system admin',         isActive: true  },
    { userTypeId: utManager._id,  name: 'Rajesh Kumar',   username: 'rajesh.kumar',  passwordHash: hashRajesh,     description: 'Chennai region manager',       isActive: true  },
    { userTypeId: utSalesRep._id, name: 'Priya Sharma',   username: 'priya.sharma',  passwordHash: hashPriya,      description: 'TN & KA sales rep',            isActive: true  },
    { userTypeId: utSalesRep._id, name: 'Karthik Raj',    username: 'karthik.raj',   passwordHash: hashKarthik,    description: 'MH sales rep',                 isActive: true  },
    { userTypeId: utViewer._id,   name: 'Deepa Nair',     username: 'deepa.viewer',  passwordHash: hashDeepaSales, description: 'Operations viewer',            isActive: true  },
  ]);
  ok(`Users: akilesh (Admin), rajesh.kumar (Manager), priya.sharma, karthik.raj (Sales Rep), deepa.viewer (Viewer)`);

  await Permission.insertMany([
    { userTypeId: utAdmin._id,    permissions: buildAdminPerms()   },
    { userTypeId: utManager._id,  permissions: buildManagerPerms() },
    { userTypeId: utSalesRep._id, permissions: buildSalesRepPerms() },
    { userTypeId: utViewer._id,   permissions: buildViewerPerms()  },
  ]);
  ok('Permissions set for Admin, Manager, Sales Rep, Viewer');

  /* ══════════════════════════════════════════════════════════
     MASTER — Location
  ══════════════════════════════════════════════════════════ */
  head('🌍 Seeding Location...');

  const [india, usa, uk] = await Country.insertMany([
    { name: 'India',          code: 'IN' },
    { name: 'United States',  code: 'US' },
    { name: 'United Kingdom', code: 'UK' },
  ]);
  ok('Countries: India, United States, United Kingdom');

  const [tn, mh, ka, kl, dl] = await State.insertMany([
    { name: 'Tamil Nadu',  code: 'TN', countryId: india._id },
    { name: 'Maharashtra', code: 'MH', countryId: india._id },
    { name: 'Karnataka',   code: 'KA', countryId: india._id },
    { name: 'Kerala',      code: 'KL', countryId: india._id },
    { name: 'Delhi',       code: 'DL', countryId: india._id },
  ]);
  ok('States: Tamil Nadu, Maharashtra, Karnataka, Kerala, Delhi');

  const [chn, cbe, mum, pun, blr, koc] = await City.insertMany([
    { name: 'Chennai',    stateId: tn._id },
    { name: 'Coimbatore', stateId: tn._id },
    { name: 'Mumbai',     stateId: mh._id },
    { name: 'Pune',       stateId: mh._id },
    { name: 'Bangalore',  stateId: ka._id },
    { name: 'Kochi',      stateId: kl._id },
  ]);
  ok('Cities: Chennai, Coimbatore, Mumbai, Pune, Bangalore, Kochi');

  const [p600001, p600002, p641001, p400001, p411001, p560001, p682001] = await Pincode.insertMany([
    { code: '600001', stateId: tn._id, cityId: chn._id },
    { code: '600002', stateId: tn._id, cityId: chn._id },
    { code: '641001', stateId: tn._id, cityId: cbe._id },
    { code: '400001', stateId: mh._id, cityId: mum._id },
    { code: '411001', stateId: mh._id, cityId: pun._id },
    { code: '560001', stateId: ka._id, cityId: blr._id },
    { code: '682001', stateId: kl._id, cityId: koc._id },
  ]);
  ok('Pincodes: 600001, 600002, 641001, 400001, 411001, 560001, 682001');

  const [aTNagar, aAnna, aCbe, aBandra, aKoram] = await Area.insertMany([
    { name: 'T Nagar',     pincodeId: p600001._id, cityId: chn._id, stateId: tn._id },
    { name: 'Anna Nagar',  pincodeId: p600002._id, cityId: chn._id, stateId: tn._id },
    { name: 'RS Puram',    pincodeId: p641001._id, cityId: cbe._id, stateId: tn._id },
    { name: 'Bandra West', pincodeId: p400001._id, cityId: mum._id, stateId: mh._id },
    { name: 'Koramangala', pincodeId: p560001._id, cityId: blr._id, stateId: ka._id },
  ]);
  ok('Areas: T Nagar, Anna Nagar, RS Puram, Bandra West, Koramangala');

  const [mktTN, mktAnna, mktBandra, mktKoram, mktPune] = await Market.insertMany([
    { name: 'T Nagar Market',      stateId: tn._id, districtId: chn._id },
    { name: 'Anna Nagar Market',   stateId: tn._id, districtId: chn._id },
    { name: 'Bandra Market',       stateId: mh._id, districtId: mum._id },
    { name: 'Koramangala Market',  stateId: ka._id, districtId: blr._id },
    { name: 'Pune Central Market', stateId: mh._id, districtId: pun._id },
  ]);
  ok('Markets: T Nagar, Anna Nagar, Bandra, Koramangala, Pune Central');

  /* ══════════════════════════════════════════════════════════
     MASTER — General
  ══════════════════════════════════════════════════════════ */
  head('🏪 Seeding General Master...');

  const [stRetail, stWholesale, stSuper, stConvenience, stPharmacy] = await ShopType.insertMany([
    { name: 'Retail Store',      description: 'General retail outlet' },
    { name: 'Wholesale',         description: 'Bulk wholesale dealer' },
    { name: 'Supermarket',       description: 'Large format supermarket' },
    { name: 'Convenience Store', description: 'Small neighbourhood store' },
    { name: 'Pharmacy',          description: 'Medical and pharmaceutical store' },
  ]);
  ok('Shop Types: Retail, Wholesale, Supermarket, Convenience, Pharmacy');

  await ExpType.insertMany([
    { name: 'Travel',        description: 'Transport and travel expenses' },
    { name: 'Food & Meals',  description: 'Meals during field work' },
    { name: 'Accommodation', description: 'Hotel and lodging costs' },
    { name: 'Fuel',          description: 'Petrol / diesel expenses' },
    { name: 'Communication', description: 'Phone, internet and courier charges' },
  ]);
  ok('Expense Types: Travel, Food, Accommodation, Fuel, Communication');

  await Company.insertMany([
    { name: 'Santhila Products Pvt Ltd', code: 'SPL', address: '12, Industrial Estate, Chennai - 600032', phone: '044-24981234', email: 'info@santhila.com',    contactPerson: 'Akilesh S',  gstNo: '33AABCS1234A1Z5' },
    { name: 'Santhila Exports Ltd',      code: 'SEL', address: '45, Export Zone, Coimbatore - 641001',   phone: '0422-4567890', email: 'exports@santhila.com', contactPerson: 'Vikram R',   gstNo: '33AABCS5678B1Z1' },
  ]);
  ok('Companies: Santhila Products Pvt Ltd, Santhila Exports Ltd');

  /* ══════════════════════════════════════════════════════════
     MASTER — Staff (Managers, SalesReps)
     NOTE: userTypeId here refers to admin DB's UserType._id.
     It is stored as a plain ObjectId for cross-service lookup.
  ══════════════════════════════════════════════════════════ */
  head('👷 Seeding Staff...');

  const mgrPwdHash = await bcrypt.hash('Manager@123', ROUNDS);
  const srPwdHash  = await bcrypt.hash('Sales@1234',  ROUNDS);

  const [mgr1, mgr2, mgr3] = await Manager.insertMany([
    { name: 'Rajesh Kumar',  mobile: '9876543210', email: 'rajesh.k@santhila.com',  username: 'rajesh.mgr',   passwordHash: mgrPwdHash, userTypeId: utManager._id, aadhaarNo: '123456789012', panCardNo: 'ABCPK1234D', address: { stateId: tn._id, cityId: chn._id, pincodeId: p600001._id, areaId: aTNagar._id, street: '12, Anna Street' } },
    { name: 'Suresh Menon',  mobile: '9988776655', email: 'suresh.m@santhila.com',  username: 'suresh.mgr',   passwordHash: mgrPwdHash, userTypeId: utManager._id, aadhaarNo: '234567890123', panCardNo: 'BCDPM5678E', address: { stateId: mh._id, cityId: mum._id, pincodeId: p400001._id, areaId: aBandra._id, street: '5, Sea View Road' } },
    { name: 'Anand Krishnan',mobile: '9123456789', email: 'anand.k@santhila.com',   username: 'anand.mgr',    passwordHash: mgrPwdHash, userTypeId: utManager._id, aadhaarNo: '345678901234', panCardNo: 'CDEPK9012F', address: { stateId: ka._id, cityId: blr._id, pincodeId: p560001._id, areaId: aKoram._id, street: '8, MG Road' } },
  ]);
  ok('Managers: Rajesh Kumar (TN), Suresh Menon (MH), Anand Krishnan (KA)');

  const [sr1, sr2, sr3, sr4, sr5] = await SalesRep.insertMany([
    { name: 'Priya Devi',      mobile: '9001122334', email: 'priya.d@santhila.com',   username: 'priya.sr',    passwordHash: srPwdHash, userTypeId: utSalesRep._id, managerId: mgr1._id, address: { stateId: tn._id, cityId: chn._id, pincodeId: p600001._id, areaId: aTNagar._id, street: '3, Park Lane' } },
    { name: 'Karthik Raja',    mobile: '9002233445', email: 'karthik.r@santhila.com', username: 'karthik.sr',  passwordHash: srPwdHash, userTypeId: utSalesRep._id, managerId: mgr1._id, address: { stateId: tn._id, cityId: chn._id, pincodeId: p600002._id, areaId: aAnna._id,  street: '7, West Ave' } },
    { name: 'Deepa Krishnan',  mobile: '9003344556', email: 'deepa.k@santhila.com',  username: 'deepa.sr',    passwordHash: srPwdHash, userTypeId: utSalesRep._id, managerId: mgr2._id, address: { stateId: mh._id, cityId: mum._id, pincodeId: p400001._id, areaId: aBandra._id, street: '11, Hill Road' } },
    { name: 'Farhan Ahmed',    mobile: '9004455667', email: 'farhan.a@santhila.com',  username: 'farhan.sr',   passwordHash: srPwdHash, userTypeId: utSalesRep._id, managerId: mgr2._id, address: { stateId: mh._id, cityId: pun._id, pincodeId: p411001._id, areaId: null,         street: '2, Camp Road' } },
    { name: 'Lakshmi Varma',   mobile: '9005566778', email: 'lakshmi.v@santhila.com', username: 'lakshmi.sr',  passwordHash: srPwdHash, userTypeId: utSalesRep._id, managerId: mgr3._id, address: { stateId: ka._id, cityId: blr._id, pincodeId: p560001._id, areaId: aKoram._id, street: '6, Brigade Road' } },
  ]);
  ok('Sales Reps: Priya, Karthik, Deepa, Farhan, Lakshmi');

  const dealers = await Dealer.insertMany([
    { dealerName: 'Sri Balaji Stores',       phoneNumber: '9111222333', whatsappNumber: '9111222333', email: 'balaji@stores.com',  managerId: mgr1._id, salesRepId: sr1._id, marketId: mktTN._id,    shopTypeId: stRetail._id,      address: { stateId: tn._id, cityId: chn._id, pincodeId: p600001._id, areaId: aTNagar._id, street: '45, Usman Road' },   panNo: 'ABCPD1234E', gstNo: '33ABCPD1234E1ZA' },
    { dealerName: 'Ganesh Trading Co.',      phoneNumber: '9222333444', whatsappNumber: '9222333444', email: 'ganesh@trade.com',   managerId: mgr1._id, salesRepId: sr1._id, marketId: mktAnna._id,  shopTypeId: stWholesale._id,   address: { stateId: tn._id, cityId: chn._id, pincodeId: p600002._id, areaId: aAnna._id,  street: '12, 2nd Avenue' }, panNo: 'BCDPG5678F', gstNo: '33BCDPG5678F1ZB' },
    { dealerName: 'Murugan Kirana Center',   phoneNumber: '9333444555', whatsappNumber: '9333444555', email: '',                   managerId: mgr1._id, salesRepId: sr2._id, marketId: mktTN._id,    shopTypeId: stConvenience._id, address: { stateId: tn._id, cityId: chn._id, pincodeId: p600001._id, areaId: aTNagar._id, street: '78, South Usman Rd' } },
    { dealerName: 'Sharma Wholesale',        phoneNumber: '9444555666', whatsappNumber: '9444555666', email: 'sharma@whole.com',   managerId: mgr2._id, salesRepId: sr3._id, marketId: mktBandra._id, shopTypeId: stWholesale._id,   address: { stateId: mh._id, cityId: mum._id, pincodeId: p400001._id, areaId: aBandra._id, street: '3, Linking Road' },  panNo: 'CDEPW9012G', gstNo: '27CDEPW9012G1ZC' },
    { dealerName: 'Mumbai General Supplies', phoneNumber: '9555666777', whatsappNumber: '9555666777', email: 'mgs@supply.com',     managerId: mgr2._id, salesRepId: sr3._id, marketId: mktBandra._id, shopTypeId: stSuper._id,        address: { stateId: mh._id, cityId: mum._id, pincodeId: p400001._id, areaId: aBandra._id, street: '19, Turner Road' },  panNo: 'DEFPM0123H', gstNo: '27DEFPM0123H1ZD' },
    { dealerName: 'Deccan Mart',             phoneNumber: '9666777888', whatsappNumber: '9666777888', email: 'deccan@mart.com',    managerId: mgr2._id, salesRepId: sr4._id, marketId: mktPune._id,   shopTypeId: stSuper._id,        address: { stateId: mh._id, cityId: pun._id, pincodeId: p411001._id, areaId: null,         street: '55, FC Road' },     panNo: 'EFGPD4567I', gstNo: '27EFGPD4567I1ZE' },
    { dealerName: 'Tech Value Store',        phoneNumber: '9777888999', whatsappNumber: '9777888999', email: 'techval@store.com',  managerId: mgr3._id, salesRepId: sr5._id, marketId: mktKoram._id,  shopTypeId: stRetail._id,      address: { stateId: ka._id, cityId: blr._id, pincodeId: p560001._id, areaId: aKoram._id,  street: '77, 5th Block' },   panNo: 'FGHPT8901J', gstNo: '29FGHPT8901J1ZF' },
    { dealerName: 'Bangalore Bazaar',        phoneNumber: '9888000111', whatsappNumber: '9888000111', email: 'blr@bazaar.com',     managerId: mgr3._id, salesRepId: sr5._id, marketId: mktKoram._id,  shopTypeId: stRetail._id,      address: { stateId: ka._id, cityId: blr._id, pincodeId: p560001._id, areaId: aKoram._id,  street: '101, Residency Rd' },panNo: 'GHIPB2345K', gstNo: '29GHIPB2345K1ZG' },
    { dealerName: 'Coimbatore Mart',         phoneNumber: '9900112233', whatsappNumber: '9900112233', email: 'cbe@mart.com',       managerId: mgr1._id, salesRepId: sr2._id, marketId: mktTN._id,    shopTypeId: stConvenience._id, address: { stateId: tn._id, cityId: cbe._id,  pincodeId: p641001._id, areaId: aCbe._id,     street: '23, DB Road' },     panNo: 'HIJPC6789L', gstNo: '33HIJPC6789L1ZH' },
    { dealerName: 'Kochi Fresh Mart',        phoneNumber: '9100223344', whatsappNumber: '9100223344', email: 'kochi@fresh.com',    managerId: mgr3._id, salesRepId: sr5._id, marketId: mktKoram._id,  shopTypeId: stPharmacy._id,   address: { stateId: kl._id, cityId: koc._id,  pincodeId: p682001._id, areaId: null,         street: '14, Marine Drive' }, panNo: 'IJKPK0123M', gstNo: '32IJKPK0123M1ZI' },
  ]);
  ok(`Dealers: ${dealers.length} dealers seeded (each with shopTypeId)`);

  /* ══════════════════════════════════════════════════════════
     ITEMS
  ══════════════════════════════════════════════════════════ */
  head('📦 Seeding Item Catalogue...');

  const [catFMCG, catElec, catFood] = await Category.insertMany([
    { name: 'FMCG',              code: 'FMCG', description: 'Fast Moving Consumer Goods' },
    { name: 'Electronics',       code: 'ELEC', description: 'Electronic products and accessories' },
    { name: 'Food & Beverages',  code: 'FOOD', description: 'Food products and beverages' },
  ]);
  ok('Categories: FMCG, Electronics, Food & Beverages');

  const [grpDet, grpPC, grpSnk, grpBev, grpMob, grpAcc] = await Group.insertMany([
    { name: 'Detergents & Cleaners', code: 'DET', categoryId: catFMCG._id, description: 'Washing and cleaning products' },
    { name: 'Personal Care',         code: 'PC',  categoryId: catFMCG._id, description: 'Soaps, shampoos, hygiene' },
    { name: 'Snacks & Namkeen',      code: 'SNK', categoryId: catFood._id, description: 'Savoury snacks and namkeen' },
    { name: 'Beverages',             code: 'BEV', categoryId: catFood._id, description: 'Cold drinks and juices' },
    { name: 'Mobile Phones',         code: 'MOB', categoryId: catElec._id, description: 'Smartphones and basic phones' },
    { name: 'Accessories',           code: 'ACC', categoryId: catElec._id, description: 'Cables, chargers, cases' },
  ]);
  ok('Groups: Detergents, Personal Care, Snacks, Beverages, Mobile Phones, Accessories');

  const [taxNil, tax5, tax12, tax18, tax28] = await Tax.insertMany([
    { taxType: 'GST 0%',  percentage: 0,  description: 'Nil rated goods' },
    { taxType: 'GST 5%',  percentage: 5,  description: 'Essential goods at 5%' },
    { taxType: 'GST 12%', percentage: 12, description: 'Standard goods at 12%' },
    { taxType: 'GST 18%', percentage: 18, description: 'Standard goods at 18%' },
    { taxType: 'GST 28%', percentage: 28, description: 'Luxury goods at 28%' },
  ]);
  ok('Taxes: GST 0%, 5%, 12%, 18%, 28%');

  const [uPcs, uBox, uKg, uLtr, uPack] = await UoM.insertMany([
    { abbreviation: 'PCS',  description: 'Piece / Unit' },
    { abbreviation: 'BOX',  description: 'Box / Carton' },
    { abbreviation: 'KG',   description: 'Kilogram' },
    { abbreviation: 'LTR',  description: 'Litre' },
    { abbreviation: 'PACK', description: 'Pack / Packet' },
  ]);
  ok('Units of Measure: PCS, BOX, KG, LTR, PACK');

  const [pk12, pk24, pk6, pk1] = await PackType.insertMany([
    { name: 'Box of 12',   unitsPerPack: 12, description: 'Standard 12-piece carton' },
    { name: 'Box of 24',   unitsPerPack: 24, description: 'Large 24-piece carton' },
    { name: 'Box of 6',    unitsPerPack: 6,  description: 'Small 6-piece carton' },
    { name: 'Single Unit', unitsPerPack: 1,  description: 'Individual piece' },
  ]);
  ok('Packing Types: Box of 6, 12, 24, Single Unit');

  await Counter.create({ key: 'hsnCode', seq: 10 });

  const items = await Item.insertMany([
    { itemName: 'Surf Excel Quick Wash 500g',  itemCode: 'FMCG-DET-001', categoryId: catFMCG._id, groupId: grpDet._id, taxId: tax18._id, uomId: uPack._id, packingTypeId: pk12._id, itemPrice: 85,    itemsPerBox: 12, boxRate: 7.08,  minStockLevel: 5,  maxStockLevel: 100, hsnCode: nextHsn() },
    { itemName: 'Ariel Matic 1kg',             itemCode: 'FMCG-DET-002', categoryId: catFMCG._id, groupId: grpDet._id, taxId: tax18._id, uomId: uKg._id,   packingTypeId: pk6._id,  itemPrice: 195,   itemsPerBox: 6,  boxRate: 32.5,  minStockLevel: 3,  maxStockLevel: 60,  hsnCode: nextHsn() },
    { itemName: 'Vim Dishwash Bar 200g',        itemCode: 'FMCG-DET-003', categoryId: catFMCG._id, groupId: grpDet._id, taxId: tax18._id, uomId: uPcs._id,  packingTypeId: pk24._id, itemPrice: 30,    itemsPerBox: 24, boxRate: 1.25,  minStockLevel: 10, maxStockLevel: 200, hsnCode: nextHsn() },
    { itemName: 'Dove Soap 75g',                itemCode: 'FMCG-PC-001',  categoryId: catFMCG._id, groupId: grpPC._id,  taxId: tax18._id, uomId: uPcs._id,  packingTypeId: pk24._id, itemPrice: 42,    itemsPerBox: 24, boxRate: 1.75,  minStockLevel: 10, maxStockLevel: 240, hsnCode: nextHsn() },
    { itemName: 'Head & Shoulders 180ml',       itemCode: 'FMCG-PC-002',  categoryId: catFMCG._id, groupId: grpPC._id,  taxId: tax18._id, uomId: uLtr._id,  packingTypeId: pk12._id, itemPrice: 165,   itemsPerBox: 12, boxRate: 13.75, minStockLevel: 5,  maxStockLevel: 120, hsnCode: nextHsn() },
    { itemName: 'Lays Classic Salted 26g',      itemCode: 'FOOD-SNK-001', categoryId: catFood._id, groupId: grpSnk._id, taxId: tax12._id, uomId: uPcs._id,  packingTypeId: pk24._id, itemPrice: 20,    itemsPerBox: 24, boxRate: 0.83,  minStockLevel: 20, maxStockLevel: 500, hsnCode: nextHsn() },
    { itemName: 'Kurkure Masala Munch 90g',     itemCode: 'FOOD-SNK-002', categoryId: catFood._id, groupId: grpSnk._id, taxId: tax12._id, uomId: uPcs._id,  packingTypeId: pk24._id, itemPrice: 30,    itemsPerBox: 24, boxRate: 1.25,  minStockLevel: 15, maxStockLevel: 360, hsnCode: nextHsn() },
    { itemName: 'Coca Cola 2L',                 itemCode: 'FOOD-BEV-001', categoryId: catFood._id, groupId: grpBev._id, taxId: tax12._id, uomId: uLtr._id,  packingTypeId: pk6._id,  itemPrice: 95,    itemsPerBox: 6,  boxRate: 15.83, minStockLevel: 10, maxStockLevel: 120, hsnCode: nextHsn() },
    { itemName: 'Tropicana Orange 1L',          itemCode: 'FOOD-BEV-002', categoryId: catFood._id, groupId: grpBev._id, taxId: tax12._id, uomId: uLtr._id,  packingTypeId: pk12._id, itemPrice: 110,   itemsPerBox: 12, boxRate: 9.17,  minStockLevel: 8,  maxStockLevel: 144, hsnCode: nextHsn() },
    { itemName: 'Samsung Galaxy M14 6GB 128GB', itemCode: 'ELEC-MOB-001', categoryId: catElec._id, groupId: grpMob._id, taxId: tax18._id, uomId: uPcs._id,  packingTypeId: pk1._id,  itemPrice: 12999, itemsPerBox: 1,  boxRate: 12999, minStockLevel: 2,  maxStockLevel: 20,  hsnCode: nextHsn() },
  ]);
  ok(`Items: ${items.length} items seeded (HSN00001 – HSN00010)`);

  /* ══════════════════════════════════════════════════════════
     DONE
  ══════════════════════════════════════════════════════════ */
  console.log('\n🎉 All sample data seeded successfully!\n');
  console.log('  Login Credentials:');
  console.log('  ┌─────────────────┬──────────────┬──────────────┐');
  console.log('  │ Username        │ Password     │ Role         │');
  console.log('  ├─────────────────┼──────────────┼──────────────┤');
  console.log('  │ akilesh         │ Akilesh@123  │ Admin        │');
  console.log('  │ rajesh.kumar    │ Manager@123  │ Manager      │');
  console.log('  │ priya.sharma    │ Sales@1234   │ Sales Rep    │');
  console.log('  │ karthik.raj     │ Karthik@123  │ Sales Rep    │');
  console.log('  │ deepa.viewer    │ Deepa@12345  │ Viewer       │');
  console.log('  └─────────────────┴──────────────┴──────────────┘\n');

  await Promise.all([adminConn.close(), masterConn.close(), itemsConn.close()]);
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message, err.stack?.split('\n')[1]);
  process.exit(1);
});
