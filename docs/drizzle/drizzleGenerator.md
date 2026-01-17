We've merged alternation-engine into Beta release. Try it out!
Documentation
30k+
meet drizzle
Get started
Why Drizzle?
Guides
Tutorials
Latest releases
Gotchas
Upgrade to v1.0 RC
How to upgrade?
Relational Queries v1 to v2
Fundamentals
Schema
Relations
Database connection
Query Data
Migrations
Connect
PostgreSQL
Gel
MySQL
SQLite
MSSQL
CockroachDB
SingleStore
PlanetScale Postgres
Neon
Vercel Postgres
Prisma Postgres
Supabase
Xata
PGLite
Nile
Bun SQL
PlanetScale MySQL
TiDB
Turso Cloud
Turso Database
SQLite Cloud
Cloudflare D1
Bun SQLite
Cloudflare Durable Objects
Expo SQLite
OP SQLite
React Native SQLite
AWS Data API Postgres
AWS Data API MySQL
Drizzle Proxy
Expand
Manage schema
Data types
Indexes & Constraints
Sequences
Views
Schemas
Drizzle Relations
Row-Level Security (RLS)
Extensions
[OLD] Drizzle Relations
Migrations
Overview
generate
migrate
push
pull
export
check
up
studio
Custom migrations
Migrations for teams
Web and mobile
drizzle.config.ts
Seeding
Overview
Generators
default
valuesFromArray
intPrimaryKey
number
int
boolean
date
time
timestamp
datetime
year
json
interval
string
uuid
firstName
lastName
fullName
email
phoneNumber
country
city
streetAddress
jobTitle
postcode
state
companyName
loremIpsum
point
line
bitString
inet
geometry
vector
Versioning
Access your data
Query
Select
Insert
Update
Delete
Filters
Utils
Joins
Magic sql`` operator
[OLD] Query V1
Performance
Queries
Serverless
Advanced
Set Operations
Generated Columns
Transactions
Batch
Cache
Dynamic query building
Read Replicas
Custom types
Goodies
Extensions
Prisma
ESLint Plugin
drizzle-zod
drizzle-typebox
drizzle-valibot
drizzle-arktype
drizzle-graphql
Become a Sponsor
Twitter
Discord
v1.0
94%
Benchmarks
Extension
Studio
Studio Package
Gateway
Drizzle Run
Our goodies!

Product by Drizzle Team
One Dollar Stats
$1 per mo web analytics
Generators
warning
For now, specifying arraySize along with isUnique in generators that support it will result in unique values being generated (not unique arrays), which will then be packed into arrays.

default
Generates the same given value each time the generator is called.

param	default	type
defaultValue	—	any
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  posts: {
    columns: {
      content: funcs.default({
        // value you want to generate
        defaultValue: "post content",
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

valuesFromArray
Generates values from given array

param	default	type
values	—	any[] | { weight: number; values: any[] }[]
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  posts: {
    columns: {
      title: funcs.valuesFromArray({
        // Array of values you want to generate (can be an array of weighted values)
        values: ["Title1", "Title2", "Title3", "Title4", "Title5"],
        // Property that controls whether the generated values will be unique or not
        isUnique: true,
        
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

intPrimaryKey
Generates sequential integers starting from 1.

param	default	type
—	—	—
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  posts: {
    columns: {
      id: funcs.intPrimaryKey(),
    },
  },
}));

number
Generates numbers with a floating point within the given range

param	default	type
isUnique	database column uniqueness	boolean
precision	100	number
maxValue	`precision * 1000` if isUnique equals false `precision * count` if isUnique equals true	number
minValue	-maxValue	number
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  products: {
    columns: {
      unitPrice: funcs.number({
        // lower border of range.
        minValue: 10,
        // upper border of range.
        maxValue: 120,
        
        // precision of generated number:
        // precision equals 10 means that values will be accurate to one tenth (1.2, 34.6);
        // precision equals 100 means that values will be accurate to one hundredth (1.23, 34.67).
        precision: 100,
        // property that controls if generated values gonna be unique or not.
        isUnique: false,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

int
Generates integers within the given range

param	default	type
isUnique	database column uniqueness	boolean
maxValue	`1000` if isUnique equals false `count * 10` if isUnique equals true	number | bigint
minValue	-maxValue	number | bigint
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  products: {
    columns: {
      unitsInStock: funcs.int({
        // lower border of range.
        minValue: 0,
        // lower border of range.
        maxValue: 100,
        // property that controls if generated values gonna be unique or not.
        isUnique: false,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

boolean
Generates boolean values (true or false)

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      isAvailable: funcs.boolean({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

date
Generates a date within the given range

param	default	type
minDate	new Date('2020-05-08')	string | Date
maxDate	new Date('2028-05-08')	string | Date
arraySize	—	number
IMPORTANT
If only one of the parameters (minDate or maxDate) is provided, the unspecified parameter will be calculated by adding or subtracting 8 years to/from the specified one

import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      birthDate: funcs.date({
        // lower border of range.
        minDate: "1990-01-01",
        // upper border of range.
        maxDate: "2010-12-31",
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

time
Generates time in 24-hour format

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      birthTime: funcs.time({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

timestamp
Generates timestamps

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  orders: {
    columns: {
      shippedDate: funcs.timestamp({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

datetime
Generates datetime objects

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  orders: {
    columns: {
      shippedDate: funcs.datetime({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

year
Generates years in YYYY format

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      birthYear: funcs.year({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

json
Generates JSON objects with a fixed structure

{ email, name, isGraduated, hasJob, salary, startedWorking, visitedCountries}
// or
{ email, name, isGraduated, hasJob, visitedCountries }

The JSON structure will be picked randomly

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      metadata: funcs.json({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

interval
Generates time intervals.

Example of a generated value: 1 year 12 days 5 minutes

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      timeSpentOnWebsite: funcs.interval({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: true,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

string
Generates random strings

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      hashedPassword: funcs.string({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: false,
        
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

uuid
Generates v4 UUID strings

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  products: {
    columns: {
      id: funcs.uuid({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

firstName
Generates a person’s first name

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      firstName: funcs.firstName({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: true,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

lastName
Generates a person’s last name

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      lastName: funcs.lastName({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: false,
        
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

fullName
Generates a person’s full name

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      fullName: funcs.fullName({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: true,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

email
Generates unique email addresses

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      email: funcs.email({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

phoneNumber
Generates unique phone numbers

param	default	type
template	—	string
prefixes	Used dataset for prefixes	string[]
generatedDigitsNumbers	7 - if prefixes was defined	number | number[]
arraySize	—	number
import { seed } from "drizzle-seed";
//generate phone number using template property
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      phoneNumber: funcs.phoneNumber({ 
        // `template` - phone number template, where all '#' symbols will be substituted with generated digits.
        template: "+(380) ###-####",
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

import { seed } from "drizzle-seed";
//generate phone number using prefixes and generatedDigitsNumbers properties
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      phoneNumber: funcs.phoneNumber({
        // `prefixes` - array of any string you want to be your phone number prefixes.(not compatible with `template` property)
        prefixes: ["+380 99", "+380 67"],
        // `generatedDigitsNumbers` - number of digits that will be added at the end of prefixes.(not compatible with `template` property)
        generatedDigitsNumbers: 7,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

import { seed } from "drizzle-seed";
// generate phone number using prefixes and generatedDigitsNumbers properties but with different generatedDigitsNumbers for prefixes
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      phoneNumber: funcs.phoneNumber({
        // `prefixes` - array of any string you want to be your phone number prefixes.(not compatible with `template` property)
        prefixes: ["+380 99", "+380 67", "+1"],
        // `generatedDigitsNumbers` - number of digits that will be added at the end of prefixes.(not compatible with `template` property)
        generatedDigitsNumbers: [7, 7, 10],
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

country
Generates country’s names

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      country: funcs.country({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: false,
        
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

city
Generates city’s names

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      city: funcs.city({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: false,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

streetAddress
Generates street address

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      streetAddress: funcs.streetAddress({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: false,
        
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3 
      }),
    },
  },
}));

jobTitle
Generates job titles

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      jobTitle: funcs.jobTitle({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

postcode
Generates postal codes

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      postcode: funcs.postcode({
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: true,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

state
Generates US states

param	default	type
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      state: funcs.state({
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

companyName
Generates random company’s names

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  users: {
    columns: {
      company: funcs.companyName({ 
        // `isUnique` - property that controls whether the generated values will be unique or not
        isUnique: true,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

loremIpsum
Generates lorem ipsum text sentences.

param	default	type
sentencesCount	1	number
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  posts: {
    columns: {
      content: funcs.loremIpsum({
        // `sentencesCount` - number of sentences you want to generate as one generated value(string).
        sentencesCount: 2,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

point
Generates 2D points within specified ranges for x and y coordinates.

param	default	type
isUnique	database column uniqueness	boolean
maxXValue	`10 * 1000` if isUnique equals false `10 * count` if isUnique equals true	number
minXValue	-maxXValue	number
maxYValue	`10 * 1000` if isUnique equals false `10 * count` if isUnique equals true	number
minYValue	-maxYValue	number
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  triangles: {
    columns: {
      pointCoords: funcs.point({
        // `isUnique` - property that controls if generated values gonna be unique or not.
        isUnique: true,
        // `minXValue` - lower bound of range for x coordinate.
        minXValue: -5,
        // `maxXValue` - upper bound of range for x coordinate.
        maxXValue: 20,
        // `minYValue` - lower bound of range for y coordinate.
        minYValue: 0,
        // `maxYValue` - upper bound of range for y coordinate.
        maxYValue: 30,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

line
Generates 2D lines within specified ranges for a, b and c parameters of line.

line equation: a*x + b*y + c = 0

param	default	type
isUnique	database column uniqueness	boolean
maxAValue	`10 * 1000` if isUnique equals false `10 * count` if isUnique equals true	number
minAValue	-maxAValue	number
maxBValue	`10 * 1000` if isUnique equals false `10 * count` if isUnique equals true	number
minBValue	-maxBValue	number
maxCValue	`10 * 1000` if isUnique equals false `10 * count` if isUnique equals true	number
minCValue	-maxCValue	number
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  lines: {
    columns: {
      lineParams: funcs.point({
        // `isUnique` - property that controls if generated values gonna be unique or not.
        isUnique: true,
        // `minAValue` - lower bound of range for a parameter.
        minAValue: -5,
        // `maxAValue` - upper bound of range for x parameter.
        maxAValue: 20,
        // `minBValue` - lower bound of range for y parameter.
        minBValue: 0,
        // `maxBValue` - upper bound of range for y parameter.
        maxBValue: 30,
        // `minCValue` - lower bound of range for y parameter.
        minCValue: 0,
        // `maxCValue` - upper bound of range for y parameter.
        maxCValue: 10,
        // number of elements in each one-dimensional array. 
        // (If specified, arrays will be generated.)
        arraySize: 3
      }),
    },
  },
}));

bitString
Generates bit strings based on specified parameters.

param	default	type
isUnique	database column uniqueness	boolean
dimensions	database column bit-length	number
arraySize	—	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  bitStringTable: {
    columns: {
      bit: funcs.bitString({
        // desired length of each bit string (e.g., `dimensions = 3` produces values like `'010'`).
        dimensions: 12,
        // property that controls if generated values gonna be unique or not;
        isUnique: true,
        // number of elements in each one-dimensional array (If specified, arrays will be generated);
        arraySize: 3,
      }),
    },
  },
}));

inet
Generates ip addresses based on specified parameters.

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
ipAddress	'ipv4'	'ipv4' | 'ipv6'
includeCidr	true	boolean
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  inetTable: {
    columns: {
      inet: funcs.inet({
        // property that controls if generated values gonna be unique or not;
        isUnique: true,
        // number of elements in each one-dimensional array (If specified, arrays will be generated);
        arraySize: 3,
        // type of IP address to generate — either "ipv4" or "ipv6";
        ipAddress: "ipv4",
        // determines whether generated IPs include a CIDR suffix.
        includeCidr: true,
      }),
    },
  },
}));

geometry
Generates geometry objects based on the given parameters.

warnings
Currently, if you set arraySize to a value greater than 1 or try to insert more than one geometry point element into a geometry(point, 0)[] column in PostgreSQL or CockroachDB via drizzle-orm, you’ll encounter an error.

This bug is already in the backlog.

❌
import { seed } from "drizzle-seed";
import { geometry, pgTable } from 'drizzle-orm/pg-core';
const geometryTable = pgTable('geometry_table', {
	geometryArray: geometry('geometry_array', { type: 'point', srid: 0 }).array(3),
});
await seed(db, { geometryTable }, { count: 1000 }).refine((funcs) => ({
  geometryTable: {
    columns: {
      geometryArray: funcs.geometry({
        // currently arraySize with values > 1 are not supported
        arraySize: 3,
      }),
    },
  },
}));

✅
import { seed } from "drizzle-seed";
import { geometry, pgTable } from 'drizzle-orm/pg-core';
const geometryTable = pgTable('geometry_table', {
	geometryArray: geometry('geometry_array', { type: 'point', srid: 0 }).array(1),
});
await seed(db, { geometryTable }, { count: 1000 }).refine((funcs) => ({
  geometryTable: {
    columns: {
      geometryArray: funcs.geometry({
        // will work as expected
        arraySize: 1,
      }),
    },
  },
}));

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
type	'point'	'point'
srid	4326	4326 | 3857
decimalPlaces	6	1 | 2 | 3 | 4 | 5 | 6 | 7
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  geometryTable: {
    columns: {
      geometryPointTuple: funcs.geometry({
        // property that controls if generated values gonna be unique or not;
        isUnique: true,
        // number of elements in each one-dimensional array (If specified, arrays will be generated);
        arraySize: 1,
        // geometry type to generate; currently only `'point'` is supported;
        type: "point",
        // Spatial Reference System Identifier: determines what type of point will be generated - either `4326` or `3857`;
        srid: 4326,
        // number of decimal places for points when `srid` is `4326` (e.g., `decimalPlaces = 3` produces values like `'point(30.723 46.482)'`).
        decimalPlaces: 5,
      }),
    },
  },
}));

vector
Generates vectors based on the provided parameters.

param	default	type
isUnique	database column uniqueness	boolean
arraySize	—	number
decimalPlaces	2	number
dimensions	database column’s dimensions	number
minValue	-1000	number
maxValue	1000	number
import { seed } from "drizzle-seed";
await seed(db, schema, { count: 1000 }).refine((funcs) => ({
  vectorTable: {
    columns: {
      vector: funcs.vector({
        // property that controls if generated values gonna be unique or not;
        isUnique: true,
        // number of elements in each one-dimensional array (If specified, arrays will be generated);
        arraySize: 3,
        // number of decimal places for each vector element (e.g., `decimalPlaces = 3` produces values like `1.123`);
        decimalPlaces: 5,
        // number of elements in each generated vector (e.g., `dimensions = 3` produces values like `[1,2,3]`);
        dimensions: 12,
        // minimum allowed value for each vector element;
        minValue: -100,
        // maximum allowed value for each vector element.
        maxValue: 100,
      }),
    },
  },
}));

Drizzle ORM - Generators