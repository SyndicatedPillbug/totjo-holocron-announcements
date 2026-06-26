#!/usr/bin/env node

/**
 * Validate announcements.json feed.
 *
 * Checks:
 * - valid JSON
 * - schemaVersion === 1
 * - updatedAt is a valid date
 * - announcements is an array
 * - each entry has required fields with correct types
 * - no duplicate ids
 * - dates are valid
 * - action hrefs are safe (internal /path or https)
 * - no unsafe javascript: links
 *
 * Usage:
 *   node scripts/validate.mjs
 *   node scripts/validate.mjs path/to/announcements.json
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = resolve(__dirname, '../announcements.json');

const VALID_KINDS = ['totjo', 'sermon', 'doctrine', 'event', 'app', 'practice'];
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const VALID_PLACEMENTS = ['badge', 'banner', 'modal', 'card'];

let exitCode = 0;
let errors = [];
const seenIds = new Set();

function error(msg) {
  errors.push(msg);
  exitCode = 1;
}

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isPositiveInteger(v) {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

function isValidDate(v) {
  if (typeof v !== 'string') return false;
  return !Number.isNaN(new Date(v).getTime());
}

function isSafeHref(v) {
  if (typeof v !== 'string') return false;
  if (v.startsWith('/')) return true;
  try { return new URL(v).protocol === 'https:'; } catch { return false; }
}

function validateEntry(entry, index) {
  if (!entry || typeof entry !== 'object') {
    error(`Entry ${index}: must be an object`);
    return;
  }

  if (!isNonEmptyString(entry.id)) {
    error(`Entry ${index}: missing or empty id`);
  } else if (seenIds.has(entry.id)) {
    error(`Entry ${index}: duplicate id "${entry.id}"`);
  } else {
    seenIds.add(entry.id);
  }

  if (!isPositiveInteger(entry.version)) {
    error(`Entry ${index}: version must be a positive integer`);
  }

  if (!VALID_KINDS.includes(entry.kind)) {
    error(`Entry ${index}: invalid kind "${entry.kind}"`);
  }

  if (!VALID_PRIORITIES.includes(entry.priority)) {
    error(`Entry ${index}: invalid priority "${entry.priority}"`);
  }

  if (!VALID_PLACEMENTS.includes(entry.placement)) {
    error(`Entry ${index}: invalid placement "${entry.placement}"`);
  }

  if (!isNonEmptyString(entry.title)) {
    error(`Entry ${index}: missing or empty title`);
  }

  if (typeof entry.body !== 'string' || entry.body.trim().length === 0) {
    error(`Entry ${index}: missing or empty body`);
  }

  if (!isValidDate(entry.publishedAt)) {
    error(`Entry ${index}: invalid publishedAt`);
  }

  if (entry.startsAt !== undefined && !isValidDate(entry.startsAt)) {
    error(`Entry ${index}: invalid startsAt`);
  }

  if (entry.expiresAt !== undefined && !isValidDate(entry.expiresAt)) {
    error(`Entry ${index}: invalid expiresAt`);
  }

  if (entry.dismissible !== undefined && typeof entry.dismissible !== 'boolean') {
    error(`Entry ${index}: dismissible must be boolean`);
  }

  if (entry.action !== undefined) {
    if (!entry.action || typeof entry.action !== 'object') {
      error(`Entry ${index}: action must be an object`);
    } else {
      if (!isNonEmptyString(entry.action.label)) {
        error(`Entry ${index}: action label missing or empty`);
      }
      if (!isSafeHref(entry.action.href)) {
        error(`Entry ${index}: unsafe action href "${entry.action.href}"`);
      }
    }
  }
}

// --- Main ---
const feedPath = process.argv[2] || DEFAULT_PATH;

if (!existsSync(feedPath)) {
  console.error(`File not found: ${feedPath}`);
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(feedPath, 'utf8');
} catch (e) {
  console.error(`Could not read file: ${e.message}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error(`Invalid JSON: ${e.message}`);
  process.exit(1);
}

const allChecksPassed = true;
console.log(`Feed path: ${feedPath}`);

// schemaVersion
if (data.schemaVersion !== 1) {
  error(`schemaVersion must be 1, got ${data.schemaVersion}`);
}

console.log(`Schema version: ${data.schemaVersion}`);

// updatedAt
if (!isValidDate(data.updatedAt)) {
  error(`updatedAt must be a valid date string, got "${data.updatedAt}"`);
} else {
  console.log(`Updated at: ${data.updatedAt}`);
}

// announcements array
if (!Array.isArray(data.announcements)) {
  error('announcements must be an array');
  console.error(`Errors: ${errors.length}`);
  process.exit(1);
}

console.log(`Total entries: ${data.announcements.length}`);

for (const [index, entry] of data.announcements.entries()) {
  validateEntry(entry, index);
}

if (errors.length === 0) {
  console.log(`All entries valid.`);
} else {
  console.log(`Errors: ${errors.length}`);
  for (const msg of errors) {
    console.error(`  - ${msg}`);
  }
}

process.exit(exitCode);
